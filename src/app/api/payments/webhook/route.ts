import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getYooKassaPayment } from "@/lib/yookassa";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    const paymentId = notification?.object?.id;
    if (typeof paymentId !== "string" || !paymentId) return NextResponse.json({ ok: true });
    const payment = await getYooKassaPayment(paymentId);
    if (payment.status !== "succeeded" || payment.paid !== true) return NextResponse.json({ ok: true });
    const orderId = payment.metadata?.order_id;
    if (!orderId) return NextResponse.json({ ok: true });
    const admin = createAdminClient();
    const { data: order, error } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error || !order || order.payment_id !== payment.id) return NextResponse.json({ ok: true });
    const paidAmount = Number(payment.amount?.value);
    if (payment.amount?.currency !== "RUB" || !Number.isFinite(paidAmount) || paidAmount !== Number(order.amount)) {
      console.error("Payment amount mismatch", order.id);
      return NextResponse.json({ error: "Payment mismatch" }, { status: 400 });
    }
    if (order.status !== "paid" && order.status !== "delivered") {
      const { error: updateError } = await admin.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending");
      if (updateError) throw updateError;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("YooKassa webhook verification error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Could not process notification" }, { status: 500 });
  }
}

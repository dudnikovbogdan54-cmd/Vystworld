import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findProduct } from "@/lib/catalog";
import { createYooKassaPayment } from "@/lib/yookassa";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Сначала войди в аккаунт." }, { status: 401 });
    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : "";
    const minecraftNick = typeof body.minecraftNick === "string" ? body.minecraftNick.trim() : "";
    if (!/^[A-Za-z0-9_]{3,16}$/.test(minecraftNick)) return NextResponse.json({ error: "Некорректный Minecraft-ник." }, { status: 400 });
    const product = findProduct(productId);
    if (!product) return NextResponse.json({ error: "Товар не найден." }, { status: 400 });
    const admin = createAdminClient();
    const { data: order, error: dbError } = await admin.from("orders").insert({
      user_id: user.id, product_id: product.id, product_name: product.name,
      amount: product.price.toFixed(2), currency: "RUB", status: "pending",
      minecraft_nick: minecraftNick, delivery_command: product.command.replaceAll("{player}", minecraftNick)
    }).select("id").single();
    if (dbError || !order) throw new Error("Не удалось создать заказ в базе данных.");
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const payment = await createYooKassaPayment({
      amount: product.price, orderId: order.id, description: `VystWorld: ${product.name}`,
      returnUrl: process.env.YOOKASSA_RETURN_URL || `${origin}/payment/return`
    });
    const { error: updateError } = await admin.from("orders").update({ payment_id: payment.id }).eq("id", order.id);
    if (updateError) throw new Error("Платёж создан, но заказ не удалось обновить. Проверь панель YooKassa.");
    if (!payment.confirmation?.confirmation_url) throw new Error("ЮKassa не вернула ссылку для оплаты.");
    return NextResponse.json({ orderId: order.id, confirmationUrl: payment.confirmation.confirmation_url });
  } catch (error) {
    console.error("payment-create error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Не удалось создать оплату. Проверь настройки сервера или попробуй позже." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
function authorized(request: Request) {
  const expected = process.env.MINECRAFT_BRIDGE_SECRET || "";
  const supplied = request.headers.get("x-vystworld-secret") || "";
  if (!expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (typeof body.orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", body.orderId).eq("status", "paid").is("delivered_at", null);
  if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

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
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin.from("orders").select("id,minecraft_nick,delivery_command,product_name").eq("status", "paid").is("delivered_at", null).order("paid_at", { ascending: true }).limit(10);
  if (error) return NextResponse.json({ error: "Database error" }, { status: 500 });
  return NextResponse.json({ deliveries: data || [] });
}

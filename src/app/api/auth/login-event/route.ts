import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, logging: false });

    const ip = request.headers.get("x-real-ip")?.trim().slice(0, 64) || null;
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const admin = createAdminClient();
    const { data: recent } = await admin.from("login_events").select("id").eq("user_id", user.id).gte("created_at", new Date(Date.now() - 30_000).toISOString()).limit(1);
    if (recent?.length) return NextResponse.json({ ok: true, logging: true });
    const { error } = await admin.from("login_events").insert({
      user_id: user.id, email: user.email ?? null, ip_address: ip, user_agent: userAgent, event_type: "login_success"
    });
    if (error) console.error("Login event could not be saved");
    return NextResponse.json({ ok: true, logging: !error });
  } catch {
    return NextResponse.json({ ok: true, logging: false });
  }
}

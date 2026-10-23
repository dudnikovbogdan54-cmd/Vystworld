import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const admin = createAdminClient();
          await admin.from("login_events").insert({ user_id: user.id, email: user.email ?? null, ip_address: request.headers.get("x-real-ip")?.trim().slice(0, 64) || null, user_agent: request.headers.get("user-agent")?.slice(0, 500) || null, event_type: "login_success" });
        } catch { /* Authentication should still succeed if audit logging is unavailable. */ }
      }
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=oauth_callback", url.origin));
}

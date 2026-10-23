import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Добавь SUPABASE_SERVICE_ROLE_KEY в Vercel." }, { status: 503 });
  }
  try {
    const admin = createAdminClient();
    const [{ data: usersData, error: usersError }, { data: events, error: eventsError }] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 100 }),
      admin.from("login_events").select("id,user_id,email,ip_address,user_agent,event_type,created_at").order("created_at", { ascending: false }).limit(200)
    ]);
    if (usersError || eventsError) return NextResponse.json({ error: "Не удалось загрузить данные. Проверь SQL-схему и права Supabase." }, { status: 500 });
    const users = (usersData?.users ?? []).map((u) => ({
      id: u.id, email: u.email ?? "", created_at: u.created_at, last_sign_in_at: u.last_sign_in_at,
      provider: String(u.app_metadata?.provider ?? "email")
    }));
    return NextResponse.json({ users, events: events ?? [] }, { headers: { "Cache-Control": "no-store, private" } });
  } catch {
    return NextResponse.json({ error: "Админ-панель не настроена." }, { status: 503 });
  }
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return <main className="container page"><section className="formbox"><h1>Админ-панель пока не настроена</h1><p className="muted">Сначала подключи Supabase в переменных окружения Vercel.</p><Link className="btn" href="/">На главную</Link></section></main>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user) redirect("/login?next=/admin");
  if (!adminEmail || user.email?.toLowerCase() !== adminEmail) redirect("/account");

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return <main className="container page"><section className="formbox"><h1>Админ-панель</h1><div className="notice">Добавь SUPABASE_SERVICE_ROLE_KEY в переменные окружения Vercel и выполни supabase/schema.sql вместе с supabase/account-features.sql.</div><Link className="btn" href="/account">В личный кабинет</Link></section></main>;

  let users: Array<{id:string;email?:string;created_at:string;last_sign_in_at?:string;app_metadata?:Record<string,unknown>}> = [];
  let events: Array<{id:string;email:string|null;ip_address:string|null;user_agent:string|null;event_type:string;created_at:string}> = [];
  let error = "";
  try {
    const admin = createAdminClient();
    const [userResult, eventResult] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 100 }),
      admin.from("login_events").select("id,email,ip_address,user_agent,event_type,created_at").order("created_at", { ascending: false }).limit(200)
    ]);
    if (userResult.error || eventResult.error) error = "Не удалось загрузить данные. Проверь SQL-схему Supabase.";
    users = userResult.data?.users ?? [];
    events = eventResult.data ?? [];
  } catch { error = "Не удалось подключиться к Supabase Admin API."; }

  return <main className="container page admin-page">
    <div className="sectionhead"><div><span className="tag">Управление сайтом</span><h1 style={{fontSize:42,margin:"12px 0 8px"}}>Админ-панель</h1><p className="muted">Вход выполнен как {user.email}. Данные доступны только адресу из ADMIN_EMAIL.</p></div><Link className="btn" href="/account">Личный кабинет ↗</Link></div>
    {error && <div className="notice error">{error}</div>}
    <div className="stats-grid"><article className="card"><span className="muted">Аккаунтов в первой странице</span><strong className="stat-number">{users.length}</strong></article><article className="card"><span className="muted">Записей входа</span><strong className="stat-number">{events.length}</strong></article><article className="card"><span className="muted">Показано пользователей</span><strong className="stat-number">{users.length} / 100</strong></article></div>
    <section className="card"><h2 style={{marginTop:0}}>Созданные аккаунты</h2><p className="muted">Показаны первые 100 аккаунтов. Для каждого отображаются email, провайдер и даты.</p><div className="table-wrap"><table className="table"><thead><tr><th>Email</th><th>Способ</th><th>Создан</th><th>Последний вход</th></tr></thead><tbody>{users.map((u)=><tr key={u.id}><td>{u.email || "—"}</td><td>{String(u.app_metadata?.provider ?? "email")}</td><td>{new Date(u.created_at).toLocaleString("ru-RU")}</td><td>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("ru-RU") : "Ещё не входил"}</td></tr>)}{users.length===0&&<tr><td colSpan={4}>Пока нет аккаунтов или данные недоступны.</td></tr>}</tbody></table></div></section>
    <section className="card"><h2 style={{marginTop:0}}>Журнал успешных входов</h2><p className="muted">Хранятся последние 200 записей. IP может отсутствовать, если платформа не передала его в заголовке.</p><div className="table-wrap"><table className="table"><thead><tr><th>Время</th><th>Аккаунт</th><th>IP-адрес</th><th>Устройство / браузер</th></tr></thead><tbody>{events.map((e)=><tr key={e.id}><td>{new Date(e.created_at).toLocaleString("ru-RU")}</td><td>{e.email || "—"}</td><td>{e.ip_address || "Не определён"}</td><td className="ua-cell">{e.user_agent || "—"}</td></tr>)}{events.length===0&&<tr><td colSpan={4}>Записей пока нет. Они появятся после настройки service role и следующего входа.</td></tr>}</tbody></table></div></section>
    <p className="muted small-note">Для приватности журналируются только успешные входы. Не используй эти данные для публикации или передачи посторонним.</p>
  </main>;
}

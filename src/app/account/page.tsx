import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./signout-button";

export default async function AccountPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return (
      <main className="container page">
        <section className="formbox">
          <h1>Личный кабинет временно недоступен</h1>
          <p className="muted">Для входа ещё не подключён Supabase. Главная страница и магазин доступны, но регистрация и история заказов заработают после настройки переменных окружения.</p>
          <Link className="btn primary" href="/">На главную</Link>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: orders } = await supabase.from("orders").select("id,product_name,amount,currency,status,created_at,minecraft_nick").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);

  return <main className="container page"><div className="sectionhead"><div><h1 style={{fontSize:40,margin:"0 0 8px"}}>Личный кабинет</h1><p>{user.email}</p></div><SignOutButton/></div>
    <div className="tabs"><Link className="active" href="/account">Мои заказы</Link><Link href="/shop">Магазин</Link></div>
    <section className="card"><h2 style={{marginTop:0}}>История заказов</h2>{orders?.length ? <div style={{overflowX:"auto"}}><table className="table"><thead><tr><th>Товар</th><th>Ник</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.product_name}</td><td>{o.minecraft_nick}</td><td>{Number(o.amount).toFixed(2)} {o.currency}</td><td><span className="pill">{o.status}</span></td><td>{new Date(o.created_at).toLocaleDateString("ru-RU")}</td></tr>)}</tbody></table></div>:<div className="empty">Заказов пока нет. <Link href="/shop" style={{color:"var(--green)"}}>Открыть магазин →</Link></div>}</section>
    <p className="muted" style={{fontSize:12,marginTop:18}}>Аккаунт: {user.id}</p></main>;
}

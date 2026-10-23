"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return setError("Вход пока не настроен: администратору нужно подключить Supabase в Vercel.");
    setBusy(true); setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    router.push(next); router.refresh();
  }

  async function google() {
    if (!configured) return setError("Вход пока не настроен: администратору нужно подключить Supabase в Vercel.");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError(error.message);
  }

  return (
    <main className="container page"><section className="formbox">
      <h1>С возвращением</h1><p className="muted">Войди в аккаунт VystWorld.</p>
      {!configured && <div className="notice">Авторизация ещё не подключена. Главная страница сайта доступна, но для входа администратору нужно настроить Supabase.</div>}
      {error && <div className="notice error">{error}</div>}
      <button className="btn wide" onClick={google} disabled={!configured}>◎ Продолжить с Google</button>
      <div style={{textAlign:"center",color:"var(--muted)",fontSize:12,margin:"18px 0"}}>или по электронной почте</div>
      <form onSubmit={login}>
        <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="field"><label htmlFor="password">Пароль</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>
        <button className="btn primary wide" disabled={busy || !configured}>{busy ? "Входим…" : "Войти"}</button>
      </form>
      <p className="muted" style={{fontSize:13,marginTop:18}}>Нет аккаунта? <Link href="/register" style={{color:"var(--green)"}}>Зарегистрироваться</Link></p>
      <p className="muted" style={{fontSize:12}}>Восстановление пароля можно подключить через письмо Supabase Auth после настройки SMTP.</p>
    </section></main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="container page"><section className="formbox"><p>Загрузка…</p></section></main>}><LoginForm /></Suspense>;
}

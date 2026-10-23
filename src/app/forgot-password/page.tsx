"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!configured) {
      setError("Восстановление пароля пока не настроено. Администратору нужно подключить Supabase.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) setError("Не удалось отправить письмо. Проверь адрес и попробуй позже.");
      else setMessage("Если для этого адреса существует аккаунт, на почту придёт ссылка для восстановления пароля.");
    } catch {
      setError("Не удалось отправить письмо. Попробуй позже.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="container page"><section className="formbox">
    <h1>Восстановление пароля</h1>
    <p className="muted">Укажи email, который использовал при регистрации. Мы отправим ссылку для создания нового пароля.</p>
    {!configured && <div className="notice">Supabase ещё не подключён к сайту.</div>}
    {error && <div className="notice error" role="alert">{error}</div>}
    {message && <div className="notice" role="status">{message}</div>}
    <form onSubmit={submit}>
      <div className="field"><label htmlFor="email">Электронная почта</label><input id="email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></div>
      <button className="btn primary wide" disabled={busy || !configured}>{busy ? "Отправляем…" : "Отправить ссылку"}</button>
    </form>
    <p className="muted" style={{fontSize:13,marginTop:18}}><Link href="/login" style={{color:"var(--green)"}}>Вернуться ко входу</Link></p>
  </section></main>;
}

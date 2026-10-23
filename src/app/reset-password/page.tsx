"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!configured) {
        if (active) { setError("Supabase ещё не подключён к сайту."); setChecking(false); }
        return;
      }
      try {
        const supabase = createClient();
        const { data, error: sessionError } = await supabase.auth.getUser();
        if (!active) return;
        if (sessionError || !data.user) setError("Ссылка недействительна или срок её действия истёк. Запроси новую ссылку.");
        else setReady(true);
      } catch {
        if (active) setError("Не удалось проверить ссылку. Запроси новую ссылку для восстановления.");
      } finally {
        if (active) setChecking(false);
      }
    }
    void checkSession();
    return () => { active = false; };
  }, [configured]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8) { setError("Пароль должен содержать не менее 8 символов."); return; }
    if (password !== confirmPassword) { setError("Пароли не совпадают."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError("Не удалось изменить пароль. Запроси новую ссылку и попробуй ещё раз.");
      else {
        setMessage("Пароль изменён. Перенаправляем в личный кабинет…");
        window.setTimeout(() => router.replace("/account"), 900);
      }
    } catch {
      setError("Не удалось изменить пароль. Попробуй позже.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="container page"><section className="formbox">
    <h1>Новый пароль</h1>
    <p className="muted">Придумай новый пароль длиной не менее 8 символов.</p>
    {checking && <div className="notice">Проверяем ссылку…</div>}
    {error && <div className="notice error" role="alert">{error}</div>}
    {message && <div className="notice" role="status">{message}</div>}
    {!checking && ready && <form onSubmit={submit}>
      <div className="field"><label htmlFor="password">Новый пароль</label><input id="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} /></div>
      <div className="field"><label htmlFor="confirm-password">Повтори пароль</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></div>
      <button className="btn primary wide" disabled={busy}>{busy ? "Сохраняем…" : "Сохранить новый пароль"}</button>
    </form>}
    {!checking && !ready && <p className="muted" style={{fontSize:13}}><Link href="/forgot-password" style={{color:"var(--green)"}}>Запросить новую ссылку</Link></p>}
  </section></main>;
}

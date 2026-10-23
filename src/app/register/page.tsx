"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [info,setInfo]=useState(""); const [busy,setBusy]=useState(false);
 const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
 async function register(e:React.FormEvent<HTMLFormElement>){e.preventDefault();if(!configured){setError("Регистрация пока не настроена: администратору нужно подключить Supabase в Vercel.");return;}setBusy(true);setError("");setInfo("");const supabase=createClient();const {error}=await supabase.auth.signUp({email,password,options:{emailRedirectTo:`${window.location.origin}/auth/callback?next=/account`}});setBusy(false);if(error){setError(error.message);return;}setInfo("Проверь почту и перейди по ссылке подтверждения, если подтверждение включено в настройках Supabase.");}
 async function google(){if(!configured){setError("Регистрация пока не настроена: администратору нужно подключить Supabase в Vercel.");return;}const supabase=createClient();const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${window.location.origin}/auth/callback?next=/account`}});if(error)setError(error.message);}
 return <main className="container page"><section className="formbox"><h1>Создать аккаунт</h1><p className="muted">Зарегистрируйся, чтобы покупать товары и смотреть заказы.</p>{!configured&&<div className="notice">Регистрация ещё не подключена. Главная страница и магазин доступны, но для регистрации нужно настроить Supabase.</div>}{error&&<div className="notice error">{error}</div>}{info&&<div className="notice">{info}</div>}
 <button className="btn wide" onClick={google} disabled={!configured}>◎ Зарегистрироваться через Google</button><div style={{textAlign:"center",color:"var(--muted)",fontSize:12,margin:"18px 0"}}>или через email</div>
 <form onSubmit={register}><div className="field"><label htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label htmlFor="password">Пароль (минимум 8 символов)</label><input id="password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></div><button className="btn primary wide" disabled={busy || !configured}>{busy?"Создаём…":"Зарегистрироваться"}</button></form>
 <p className="muted" style={{fontSize:13,marginTop:18}}>Уже есть аккаунт? <Link href="/login" style={{color:"var(--green)"}}>Войти</Link></p></section></main>;
}

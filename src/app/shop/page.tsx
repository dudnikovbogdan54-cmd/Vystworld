"use client";
import { useState } from "react";
import { catalog } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/client";

export default function ShopPage() {
  const [category, setCategory] = useState<"all"|"rank"|"items">("all");
  const [busy, setBusy] = useState<string|null>(null);
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const items = catalog.filter(p => category === "all" || p.category === category);
  async function buy(productId: string) {
    setMessage("");
    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) { setMessage("Укажи корректный Minecraft-ник (3–16 латинских букв, цифр или _)."); return; }
    setBusy(productId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/shop"; return; }
      const response = await fetch("/api/payments/create", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({productId, minecraftNick:nickname}) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось создать платёж.");
      if (data.confirmationUrl) window.location.href = data.confirmationUrl;
      else setMessage("Заказ создан, но платёжная система не настроена.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Ошибка. Попробуй ещё раз."); }
    finally { setBusy(null); }
  }
  return <main className="container page">
    <div className="sectionhead"><div><h1 style={{fontSize:42,margin:"0 0 8px"}}>Магазин VystWorld</h1><p>Выбери привилегию или набор для своего игрового аккаунта.</p></div></div>
    <div className="field" style={{maxWidth:380}}><label htmlFor="nick">Твой Minecraft-ник</label><input id="nick" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Например, Steve_123" maxLength={16}/></div>
    <div className="tabs">{([["all","Всё"],["rank","Привилегии"],["items","Предметы"]] as const).map(([v,label])=><button className={`btn ${category===v?"primary":""}`} key={v} onClick={()=>setCategory(v)}>{label}</button>)}</div>
    {message && <div className="notice error">{message}</div>}
    <div className="grid">{items.map(p=><article className="card" key={p.id}><span className="tag">{p.category==="rank"?"Привилегия":"Игровой набор"}</span><h3>{p.name}</h3><p>{p.description}</p><div className="price">{p.price} ₽</div><button className="btn primary" disabled={busy!==null} onClick={()=>buy(p.id)}>{busy===p.id?"Создаём заказ…":"Купить →"}</button></article>)}</div>
    <p className="muted" style={{fontSize:12,marginTop:22}}>Цены и игровые команды — примерные настройки проекта. Перед запуском проверь содержимое товаров, правила сервера и условия продажи.</p>
  </main>;
}

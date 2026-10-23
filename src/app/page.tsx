import Link from "next/link";
import { catalog } from "@/lib/catalog";
import CopyIp from "./copy-ip";

export default function Home() {
  const ranks = catalog.filter((p) => p.category === "rank");
  return <main>
    <section className="container hero">
      <div className="eyebrow"><span className="dot"/> Minecraft server · Purpur 1.21.11</div>
      <h1>Твой мир.<br/><span>Твои правила.</span></h1>
      <p>Добро пожаловать в VystWorld — место для приключений, друзей и новых историй. Заходи на сервер и создавай собственную легенду.</p>
      <div className="actions"><Link href="/shop" className="btn primary">Открыть магазин ↗</Link><a href="#connect" className="btn">Как подключиться ↓</a></div>
      <div className="serverbar"><span className="dot"/><span>IP сервера</span><strong id="server-ip">vystworld.aternos.me</strong><CopyIp/></div>
      <p style={{fontSize:12,marginTop:12}}>Если сервер Aternos выключен, сначала попроси владельца запустить его.</p>
    </section>
    <section className="container section" id="features">
      <div className="sectionhead"><div><h2>Выбери свой путь</h2><p>Всё для комфортной игры на VystWorld.</p></div><Link href="/shop" className="btn">Весь магазин →</Link></div>
      <div className="grid">{ranks.map((p) => <article className="card" key={p.id}><span className="tag">{p.badge || "Привилегия"}</span><h3>{p.name}</h3><p>{p.description}</p><div className="price">{p.price} ₽ <small>/ покупка</small></div><Link className="btn primary" href={`/shop?product=${p.id}`}>Подробнее →</Link></article>)}</div>
    </section>
    <section className="container section">
      <div className="sectionhead"><div><h2>Всё нужное — рядом</h2><p>Сайт создан для игроков, а не наоборот.</p></div></div>
      <div className="featuregrid">
        <article className="feature"><div className="symbol">⚔️</div><h3>Играй по-своему</h3><p>Исследуй мир, развивайся и играй вместе с сообществом.</p></article>
        <article className="feature"><div className="symbol">🛡️</div><h3>Аккаунт под контролем</h3><p>Войди по почте или через Google и проверяй свои заказы в личном кабинете.</p></article>
        <article className="feature"><div className="symbol">💚</div><h3>Поддержи сервер</h3><p>Выбирай привилегии и игровые наборы в магазине.</p></article>
      </div>
    </section>
    <section className="container section" id="connect">
      <div className="card" style={{textAlign:"center",padding:"34px"}}>
        <span className="tag">ТВОЁ ПРИКЛЮЧЕНИЕ НАЧИНАЕТСЯ ЗДЕСЬ</span>
        <h2 style={{fontSize:34,margin:"18px 0 8px"}}>Увидимся в VystWorld</h2>
        <p className="muted">Адрес сервера: <strong style={{color:"var(--green)"}}>vystworld.aternos.me</strong></p>
        <Link className="btn primary" href="/shop">Перейти в магазин →</Link>
      </div>
    </section>
  </main>;
}

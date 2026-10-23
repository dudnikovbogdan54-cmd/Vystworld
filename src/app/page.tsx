import Link from "next/link";
import { catalog } from "@/lib/catalog";
import CopyIp from "./copy-ip";

const steps = [
  { n: "01", title: "Скопируй адрес", text: "Нажми кнопку копирования рядом с IP сервера." },
  { n: "02", title: "Открой Minecraft", text: "Выбери сетевую игру и добавь новый сервер." },
  { n: "03", title: "Заходи и играй", text: "Подключись, познакомься с игроками и начинай приключение." },
];

const faqs = [
  { q: "Какой адрес у сервера?", a: "vystworld.aternos.me. Если сервер выключен, его сначала должен запустить владелец на Aternos." },
  { q: "Какая версия Minecraft нужна?", a: "Проект рассчитан на Purpur 1.21.11. Совместимость клиента зависит от настроек сервера." },
  { q: "Обязательно ли что-то покупать?", a: "Нет. Магазин — дополнительная возможность поддержать проект. Перед покупкой внимательно читай описание товара." },
  { q: "Почему не получается войти на сервер?", a: "Проверь адрес и версию игры, а также убедись, что сервер запущен. Если проблема остаётся, обратись к администрации." },
];

export default function Home() {
  const ranks = catalog.filter((p) => p.category === "rank").slice(0, 3);
  return <main>
    <section className="container hero">
      <div className="eyebrow"><span className="dot"/> Minecraft · Purpur 1.21.11</div>
      <h1>Твой мир.<br/><span>Твои правила.</span></h1>
      <p>VystWorld — место для приключений, развития и игры вместе с друзьями. Заходи, исследуй мир и создавай собственную историю.</p>
      <div className="actions"><Link href="#connect" className="btn primary">Начать играть <span aria-hidden="true">↗</span></Link><Link href="/shop" className="btn">Открыть магазин</Link></div>
      <div className="serverbar"><span className="dot"/><span>АДРЕС СЕРВЕРА</span><strong id="server-ip">vystworld.aternos.me</strong><CopyIp/></div>
      <p className="hero-note">Сервер размещён на Aternos и может быть выключен, когда никто не играет.</p>
      <div className="hero-stats"><div><strong>1.21.11</strong><span>Версия проекта</span></div><div><strong>Вместе</strong><span>Играй с друзьями</span></div><div><strong>Твой выбор</strong><span>Твой стиль игры</span></div></div>
    </section>

    <section className="container section" id="about">
      <div className="sectionhead"><div><span className="tag">О ПРОЕКТЕ</span><h2>Больше, чем просто сервер</h2><p>Всё необходимое для старта — в одном месте.</p></div></div>
      <div className="featuregrid">
        <article className="feature"><div className="symbol">⚔️</div><h3>Свои приключения</h3><p>Исследуй мир, собирай ресурсы и развивайся в собственном темпе.</p></article>
        <article className="feature"><div className="symbol">🤝</div><h3>Играй вместе</h3><p>Знакомься с участниками сообщества и строй общие проекты.</p></article>
        <article className="feature"><div className="symbol">🌿</div><h3>Развивайся</h3><p>Ставь цели, открывай новые возможности и создавай свою историю.</p></article>
      </div>
    </section>

    <section className="container section" id="connect">
      <div className="sectionhead"><div><span className="tag">БЫСТРЫЙ СТАРТ</span><h2>Как подключиться</h2><p>Всего три шага — и ты готов к игре.</p></div></div>
      <div className="steps-grid">{steps.map((step)=><article className="step-card" key={step.n}><span className="step-number">{step.n}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
      <div className="connect-panel"><div><span className="muted">АДРЕС ДЛЯ ПОДКЛЮЧЕНИЯ</span><strong>vystworld.aternos.me</strong><p>Если не подключается, сначала проверь, запущен ли сервер.</p></div><CopyIp/></div>
    </section>

    <section className="container section" id="shop">
      <div className="sectionhead"><div><span className="tag">МАГАЗИН</span><h2>Выбери свой статус</h2><p>Посмотри доступные привилегии проекта.</p></div><Link href="/shop" className="btn">Весь магазин →</Link></div>
      <div className="grid">{ranks.map((p)=><article className="card" key={p.id}><span className="tag">{p.badge || "Привилегия"}</span><h3>{p.name}</h3><p>{p.description}</p><div className="price">{p.price} ₽ <small>разовая покупка*</small></div><Link className="btn primary" href={`/shop?product=${p.id}`}>Подробнее →</Link></article>)}</div>
      <p className="muted small-note">* Перед публикацией проверь цены, состав привилегий и условия продажи.</p>
    </section>

    <section className="container section" id="rules">
      <div className="rules-panel"><div><span className="tag">НАШЕ СООБЩЕСТВО</span><h2>Уважай игроков</h2><p>Дружелюбная атмосфера начинается с каждого участника. Соблюдай правила сервера и указания администрации.</p></div><ul><li>Уважай других игроков</li><li>Не используй читы и запрещённые модификации</li><li>Не мешай другим играть</li><li>Не обходи ограничения и решения администрации</li></ul></div>
    </section>

    <section className="container section" id="faq">
      <div className="sectionhead"><div><span className="tag">FAQ</span><h2>Частые вопросы</h2><p>Короткие ответы перед началом игры.</p></div></div>
      <div className="faq-list">{faqs.map((item)=><details className="faq-item" key={item.q}><summary>{item.q}<span>＋</span></summary><p>{item.a}</p></details>)}</div>
    </section>

    <section className="container section">
      <div className="final-cta"><span className="tag">ТВОЁ ПРИКЛЮЧЕНИЕ НАЧИНАЕТСЯ ЗДЕСЬ</span><h2>Увидимся в VystWorld</h2><p>Скопируй адрес, заходи в Minecraft и создавай собственную историю.</p><div className="actions"><Link href="#connect" className="btn primary">Как подключиться ↓</Link><Link href="/shop" className="btn">Магазин →</Link></div></div>
    </section>
  </main>;
}

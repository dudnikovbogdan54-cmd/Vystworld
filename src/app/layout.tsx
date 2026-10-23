import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VystWorld — Minecraft сервер",
  description: "VystWorld — Minecraft-сервер Purpur 1.21.11. Узнай адрес, правила, как подключиться и посмотри магазин.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://vystworld.vercel.app")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>
    <header className="container nav">
      <Link href="/" className="brand" aria-label="VystWorld — главная"><span className="logo">V</span><span>VystWorld</span></Link>
      <nav className="navlinks" aria-label="Основная навигация"><Link href="/#about">О сервере</Link><Link href="/#connect">Подключение</Link><Link href="/#rules">Правила</Link><Link href="/shop">Магазин</Link><Link href="/#faq">FAQ</Link></nav>
      <Link className="btn nav-account" href="/account">Аккаунт ↗</Link>
    </header>
    {children}
    <footer className="container footer">
      <div><Link href="/" className="brand footer-brand"><span className="logo">V</span><span>VystWorld</span></Link><p>Неофициальный Minecraft-сервер. Minecraft является товарным знаком Mojang Studios.</p></div>
      <div className="footer-links"><Link href="/#about">О сервере</Link><Link href="/#connect">Как играть</Link><Link href="/#rules">Правила</Link><Link href="/shop">Магазин</Link><Link href="/account">Личный кабинет</Link></div>
      <span className="footer-copy">© {new Date().getFullYear()} VystWorld · Играйте честно и уважайте друг друга</span>
    </footer>
  </body></html>;
}

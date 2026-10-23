import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VystWorld — Minecraft сервер",
  description: "Присоединяйся к VystWorld — играй с друзьями, открывай новые возможности и выбирай привилегии.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>
    <header className="container nav">
      <Link href="/" className="brand"><span className="logo">V</span><span>VystWorld</span></Link>
      <nav className="navlinks"><Link href="/#features">Возможности</Link><Link href="/shop">Магазин</Link><Link href="/#connect">Как играть</Link></nav>
      <Link className="btn" href="/account">Личный кабинет ↗</Link>
    </header>
    {children}
    <footer className="container footer"><span>© {new Date().getFullYear()} VystWorld. Неофициальный Minecraft-сервер.</span><span>Играйте честно · Уважайте игроков</span></footer>
  </body></html>;
}

"use client";

import { useEffect, useState } from "react";
import { Crown, Gem, PawPrint, Pickaxe, Shield, Swords, WandSparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const avatars = [
  { value: "creeper", label: "Крипер", Icon: Shield },
  { value: "miner", label: "Шахтёр", Icon: Pickaxe },
  { value: "wolf", label: "Волк", Icon: PawPrint },
  { value: "dragon", label: "Дракон", Icon: Swords },
  { value: "king", label: "Король", Icon: Crown },
  { value: "diamond", label: "Алмаз", Icon: Gem },
  { value: "mage", label: "Маг", Icon: WandSparkles },
  { value: "warrior", label: "Воин", Icon: Swords },
];
const themes = [
  { value: "green", label: "Изумруд", color: "#39d98a" },
  { value: "blue", label: "Океан", color: "#58a6ff" },
  { value: "purple", label: "Аметист", color: "#b28cff" },
  { value: "orange", label: "Лава", color: "#ff9d52" },
];
function AvatarIcon({ value, size = 28 }: { value: string; size?: number }) {
  const item = avatars.find((avatar) => avatar.value === value) ?? avatars[0];
  const Icon = item.Icon;
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />;
}

export default function ProfileSettings({ userId, initialName, initialAvatar, initialTheme }: {
  userId: string; initialName: string; initialAvatar: string; initialTheme: string;
}) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar || "creeper");
  const [theme, setTheme] = useState(initialTheme || "green");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const selected = themes.find((item) => item.value === theme) || themes[0];
    document.documentElement.style.setProperty("--green", selected.color);
    document.documentElement.style.setProperty("--accent", selected.color);
  }, [theme]);

  async function save() {
    setBusy(true); setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: userId, display_name: name.trim().slice(0, 24), avatar, theme, updated_at: new Date().toISOString()
      }, { onConflict: "id" });
      if (error) {
        setMessage("Не удалось сохранить. Проверь настройку профилей в Supabase.");
      } else {
        window.localStorage.setItem("vystworld-theme", theme);
        setMessage("Настройки сохранены.");
      }
    } catch {
      setMessage("Не удалось сохранить настройки. Попробуй ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="card profile-settings">
    <h2 style={{ marginTop: 0 }}>Оформление профиля</h2>
    <div className="profile-preview"><span className="profile-avatar"><AvatarIcon value={avatar} size={32} /></span><div><strong>{name.trim() || "Игрок VystWorld"}</strong><p className="muted" style={{ margin: "4px 0 0" }}>Предпросмотр аккаунта</p></div></div>
    <div className="field"><label htmlFor="profile-name">Отображаемое имя</label><input id="profile-name" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Как тебя показывать на сайте" /></div>
    <p className="field-label">Выбери аватар</p>
    <div className="preset-grid">{avatars.map(({ value, label, Icon }) => <button type="button" key={value} className={avatar === value ? "preset active" : "preset"} onClick={() => setAvatar(value)} aria-pressed={avatar === value}><Icon size={25} strokeWidth={1.8} aria-hidden="true" /><small>{label}</small></button>)}</div>
    <p className="field-label">Цвет оформления</p>
    <div className="theme-grid">{themes.map((item) => <button type="button" key={item.value} className={theme === item.value ? "theme-option active" : "theme-option"} onClick={() => setTheme(item.value)} aria-pressed={theme === item.value}><span style={{ background: item.color }} />{item.label}</button>)}</div>
    <button className="btn primary" onClick={save} disabled={busy}>{busy ? "Сохраняю…" : "Сохранить оформление"}</button>
    {message && <p className="muted" role="status">{message}</p>}
  </section>;
}

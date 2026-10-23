"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const avatars = [
  { value: "🟩", label: "Крипер" }, { value: "⛏️", label: "Шахтёр" },
  { value: "🐺", label: "Волк" }, { value: "🐉", label: "Дракон" },
  { value: "👑", label: "Король" }, { value: "💎", label: "Алмаз" },
  { value: "🧙", label: "Маг" }, { value: "⚔️", label: "Воин" },
];
const themes = [
  { value: "green", label: "Изумруд", color: "#39d98a" },
  { value: "blue", label: "Океан", color: "#58a6ff" },
  { value: "purple", label: "Аметист", color: "#b28cff" },
  { value: "orange", label: "Лава", color: "#ff9d52" },
];

export default function ProfileSettings({ userId, initialName, initialAvatar, initialTheme }: {
  userId: string; initialName: string; initialAvatar: string; initialTheme: string;
}) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar || "🟩");
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
    const supabase = createClient();
    const { error } = await supabase.from("profiles").upsert({
      id: userId, display_name: name.trim().slice(0, 24), avatar, theme, updated_at: new Date().toISOString()
    }, { onConflict: "id" });
    setBusy(false);
    if (!error) window.localStorage.setItem("vystworld-theme", theme);
    setMessage(error ? "Не удалось сохранить. Проверь, что выполнил SQL-настройку профилей в Supabase." : "Настройки сохранены!");
  }

  return <section className="card profile-settings">
    <h2 style={{ marginTop: 0 }}>Оформление профиля</h2>
    <div className="profile-preview"><span className="profile-avatar">{avatar}</span><div><strong>{name.trim() || "Игрок VystWorld"}</strong><p className="muted" style={{ margin: "4px 0 0" }}>Предпросмотр аккаунта</p></div></div>
    <div className="field"><label htmlFor="profile-name">Отображаемое имя</label><input id="profile-name" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Как тебя показывать на сайте" /></div>
    <p className="field-label">Выбери аватар</p>
    <div className="preset-grid">{avatars.map((item) => <button type="button" key={item.value} className={avatar === item.value ? "preset active" : "preset"} onClick={() => setAvatar(item.value)} aria-pressed={avatar === item.value}><span>{item.value}</span><small>{item.label}</small></button>)}</div>
    <p className="field-label">Цвет оформления</p>
    <div className="theme-grid">{themes.map((item) => <button type="button" key={item.value} className={theme === item.value ? "theme-option active" : "theme-option"} onClick={() => setTheme(item.value)} aria-pressed={theme === item.value}><span style={{ background: item.color }} />{item.label}</button>)}</div>
    <button className="btn primary" onClick={save} disabled={busy}>{busy ? "Сохраняю…" : "Сохранить оформление"}</button>
    {message && <p className="muted" role="status">{message}</p>}
  </section>;
}

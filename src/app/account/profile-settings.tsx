"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const avatars = [
  { value: "creeper", label: "Крипер", image: "https://mc-heads.net/avatar/MHF_Creeper/128" },
  { value: "miner", label: "Голем", image: "https://mc-heads.net/avatar/MHF_Golem/128" },
  { value: "wolf", label: "Волк", image: "https://mc-heads.net/avatar/MHF_Wolf/128" },
  { value: "dragon", label: "Эндермен", image: "https://mc-heads.net/avatar/MHF_Enderman/128" },
  { value: "king", label: "Скелет", image: "https://mc-heads.net/avatar/MHF_Skeleton/128" },
  { value: "diamond", label: "Паук", image: "https://mc-heads.net/avatar/MHF_Spider/128" },
  { value: "mage", label: "Ифрит", image: "https://mc-heads.net/avatar/MHF_Blaze/128" },
  { value: "warrior", label: "Зомби", image: "https://mc-heads.net/avatar/MHF_PigZombie/128" },
];

const themes = [
  { value: "green", label: "Изумруд", color: "#39d98a" },
  { value: "blue", label: "Океан", color: "#58a6ff" },
  { value: "purple", label: "Аметист", color: "#b28cff" },
  { value: "orange", label: "Лава", color: "#ff9d52" },
];

const uploadedAvatarPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

function avatarSource(value: string) {
  const preset = avatars.find((item) => item.value === value);
  if (preset) return preset.image;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (supabaseUrl && uploadedAvatarPattern.test(value)) {
    return `${supabaseUrl}/storage/v1/object/public/profile-avatars/${value}`;
  }

  // Keep compatibility with photos saved by the previous version of the profile editor.
  if (supabaseUrl && value.startsWith(`${supabaseUrl}/storage/v1/object/public/profile-avatars/`)) {
    return value;
  }

  return avatars[0].image;
}

export default function ProfileSettings({ userId, initialName, initialAvatar, initialTheme }: {
  userId: string; initialName: string; initialAvatar: string; initialTheme: string;
}) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar || "creeper");
  const [theme, setTheme] = useState(initialTheme || "green");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const selected = themes.find((item) => item.value === theme) || themes[0];
    document.documentElement.style.setProperty("--green", selected.color);
    document.documentElement.style.setProperty("--accent", selected.color);
  }, [theme]);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Выбери фото в формате JPG, PNG или WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Фото должно быть не больше 2 МБ.");
      return;
    }

    setUploading(true);
    setMessage("");
    try {
      const supabase = createClient();
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });

      if (uploadError) throw uploadError;
      setAvatar(path);
      setMessage("Фото загружено. Нажми «Сохранить оформление», чтобы применить его к профилю.");
    } catch {
      setMessage("Не удалось загрузить фото. Проверь, что хранилище profile-avatars настроено в Supabase.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        display_name: name.trim().slice(0, 24),
        avatar,
        theme,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

      if (error) {
        setMessage("Не удалось сохранить. Проверь таблицу profiles и её политики доступа в Supabase.");
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
    <div className="profile-preview">
      <span className="profile-avatar">
        <img src={avatarSource(avatar)} alt="Фото профиля" width={58} height={58} />
      </span>
      <div><strong>{name.trim() || "Игрок VystWorld"}</strong><p className="muted" style={{ margin: "4px 0 0" }}>Предпросмотр аккаунта</p></div>
    </div>

    <div className="field">
      <label htmlFor="profile-name">Отображаемое имя</label>
      <input id="profile-name" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Как тебя показывать на сайте" />
    </div>

    <div className="field">
      <label htmlFor="profile-photo">Загрузить своё фото (JPG, PNG или WebP, до 2 МБ)</label>
      <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} disabled={uploading} />
      <p className="muted" style={{fontSize:11,margin:0}}>{uploading ? "Загружаем фото…" : "Можно загрузить своё изображение или выбрать готовую картинку Minecraft ниже."}</p>
    </div>

    <p className="field-label">Готовые изображения Minecraft</p>
    <div className="preset-grid">
      {avatars.map((item) => (
        <button type="button" key={item.value} className={avatar === item.value ? "preset active" : "preset"} onClick={() => setAvatar(item.value)} aria-pressed={avatar === item.value}>
          <img src={item.image} alt="" width={44} height={44} loading="lazy" />
          <small>{item.label}</small>
        </button>
      ))}
    </div>

    <p className="field-label">Цвет оформления</p>
    <div className="theme-grid">
      {themes.map((item) => (
        <button type="button" key={item.value} className={theme === item.value ? "theme-option active" : "theme-option"} onClick={() => setTheme(item.value)} aria-pressed={theme === item.value}>
          <span style={{ background: item.color }} />{item.label}
        </button>
      ))}
    </div>

    <button className="btn primary" onClick={save} disabled={busy || uploading}>{busy ? "Сохраняю…" : "Сохранить оформление"}</button>
    {message && <p className="muted" role="status">{message}</p>}
  </section>;
}

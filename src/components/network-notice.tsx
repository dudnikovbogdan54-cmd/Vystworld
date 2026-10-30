"use client";

import { useEffect, useState } from "react";

export default function NetworkNotice() {
  const [likelyProxy, setLikelyProxy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/network-status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return await response.json() as { likelyProxy?: boolean };
      })
      .then((result) => {
        if (active && result?.likelyProxy) setLikelyProxy(true);
      })
      .catch(() => {
        // Network hints are optional; never interrupt normal site navigation.
      });

    return () => { active = false; };
  }, []);

  if (!likelyProxy || dismissed) return null;

  return (
    <aside className="network-notice" role="status" aria-live="polite">
      <div>
        <strong>Похоже, соединение идёт через VPN или прокси</strong>
        <p>Для стабильной работы VystWorld рекомендуем отключить VPN. При включённом VPN отдельные функции сайта могут работать некорректно.</p>
      </div>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Скрыть предупреждение">Скрыть</button>
    </aside>
  );
}

"use client";

import { useEffect } from "react";

const colors: Record<string, string> = {
  green: "#39d98a",
  blue: "#58a6ff",
  purple: "#b28cff",
  orange: "#ff9d52",
};

export default function ThemeProvider() {
  useEffect(() => {
    const saved = window.localStorage.getItem("vystworld-theme") || "green";
    const color = colors[saved] || colors.green;
    document.documentElement.style.setProperty("--green", color);
    document.documentElement.style.setProperty("--accent", color);
  }, []);
  return null;
}

"use client";

import { useEffect } from "react";

export function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const dark = stored ? stored === "dark" : prefersDark;
      const root = document.documentElement;
      if (dark) root.classList.add("dark");
      root.style.colorScheme = dark ? "dark" : "light";
    } catch {}
  }, []);

  return null;
}

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type ThemeState = { theme: Theme; ready: boolean; error: string; chooseTheme: (theme: Theme) => void };
const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const preference = useRef<Theme | null>(null);
  const apply = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#101a16" : "#fafaf6");
    setTheme(next);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    let saved: string | null = null;
    let storage: Storage | null = null;
    try { storage = window.localStorage; saved = storage.getItem(THEME_STORAGE_KEY); } catch { /* Dùng lựa chọn trong phiên khi bộ nhớ bị chặn. */ }
    preference.current = isTheme(saved) ? saved : null;
    apply(preference.current ?? (media.matches ? "dark" : "light"));
    setReady(true);
    const systemChanged = () => { if (!preference.current) apply(media.matches ? "dark" : "light"); };
    const storageChanged = (event: StorageEvent) => {
      if ((event.storageArea && event.storageArea !== storage) || (event.key !== THEME_STORAGE_KEY && event.key !== null)) return;
      preference.current = isTheme(event.newValue) ? event.newValue : null;
      apply(preference.current ?? (media.matches ? "dark" : "light"));
      setError("");
    };
    media.addEventListener("change", systemChanged);
    window.addEventListener("storage", storageChanged);
    return () => { media.removeEventListener("change", systemChanged); window.removeEventListener("storage", storageChanged); };
  }, [apply]);

  const chooseTheme = useCallback((next: Theme) => {
    preference.current = next;
    apply(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); setError(""); }
    catch { setError("Đã đổi giao diện cho phiên này. Trình duyệt chưa cho phép lưu lựa chọn."); }
  }, [apply]);

  return <ThemeContext.Provider value={{ theme, ready, error, chooseTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeProvider chưa được khởi tạo.");
  return context;
}

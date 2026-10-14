"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, ready, error, chooseTheme } = useTheme();
  if (compact) {
    const next = theme === "dark" ? "light" : "dark";
    const label = next === "dark" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng";
    return <button type="button" className="khong-in grid h-11 w-11 shrink-0 place-items-center rounded-o border border-vien bg-trang text-muc hover:bg-bang-nhat disabled:opacity-50" disabled={!ready} aria-label={label} title={label} onClick={() => chooseTheme(next)}><Sun size={19} aria-hidden="true" className="theme-sun" /><Moon size={19} aria-hidden="true" className="theme-moon" /></button>;
  }
  return <div className="khong-in"><div role="group" aria-label="Giao diện sáng hoặc tối" className="inline-flex gap-1 rounded-o border border-vien bg-giay p-1">{([{ value: "light", label: "Sáng", icon: Sun }, { value: "dark", label: "Tối", icon: Moon }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={ready && theme === value} disabled={!ready} onClick={() => chooseTheme(value)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50 ${ready && theme === value ? "bg-bang-nhat text-bang" : "text-muc-nhat hover:bg-trang"}`}><Icon size={17} aria-hidden="true" />{label}</button>)}</div>{error && <p role="status" className="mt-2 max-w-sm text-sm text-muc-nhat">{error}</p>}</div>;
}

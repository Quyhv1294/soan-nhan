"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui";

export function ActionMenu({ label = "Tùy chọn", children }: { label?: string; children: ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 16, top: 16, width: 304, maxHeight: 400 });
  const place = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(304, window.innerWidth - 32);
    const maxHeight = Math.max(120, window.innerHeight - 32);
    const height = Math.min(popup.current?.scrollHeight || 320, maxHeight);
    const below = window.innerHeight - rect.bottom - 16;
    setPosition({ width, maxHeight, left: Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16)), top: below >= height ? rect.bottom + 8 : Math.max(16, rect.top - height - 8) });
  }, []);
  useEffect(() => {
    if (!open) return;
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open, place]);

  return <>
    <Button ref={trigger} type="button" variant="phu" popoverTarget={id} aria-expanded={open} aria-controls={id} onClick={place}><MoreHorizontal size={18} aria-hidden="true" />{label}</Button>
    <div ref={popup} id={id} popover="auto" role="group" aria-label={label} onToggle={(event) => { setOpen(event.currentTarget.matches(":popover-open")); }} onClick={(event) => { if (event.target instanceof Element && event.target.closest("[data-close-menu],a[href]")) popup.current?.hidePopover(); }} style={position} className="khong-in fixed m-0 overflow-y-auto rounded-the border border-vien bg-trang p-2 text-muc shadow-noi [&_button]:w-full [&_button]:justify-start [&_button]:text-left [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-2 [&_a]:rounded-o [&_a]:px-4 [&_a]:text-base [&_a]:font-medium [&_a]:text-bang [&_a:hover]:bg-bang-nhat [&_[role=alert]]:block [&_[role=alert]]:p-3">
      {children}
    </div>
  </>;
}

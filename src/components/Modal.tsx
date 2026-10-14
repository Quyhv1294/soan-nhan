"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./ui";

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; focused?.focus(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }} className={`khong-in m-auto max-h-[90dvh] w-[calc(100%_-_24px)] rounded-the border border-vien bg-giay p-0 text-muc shadow-noi backdrop:bg-muc/50 ${wide ? "max-w-5xl" : "max-w-xl"}`}>
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-vien bg-trang px-4 py-2"><h2 id={titleId} className="font-bold">{title}</h2><Button type="button" variant="nhe" onClick={onClose} aria-label="Đóng"><X size={20} /></Button></div>
    {children}
  </dialog>;
}

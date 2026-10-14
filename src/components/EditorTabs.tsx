"use client";

export type EditorTab = "info" | "output";
export function EditorTabs({ id, value, onChange, hasOutput = false }: { id: string; value: EditorTab; onChange: (value: EditorTab) => void; hasOutput?: boolean }) {
  return <div className="khong-in flex rounded-o border border-vien bg-trang p-1 xl:hidden" role="tablist" aria-label="Soạn bài">{(["info", "output"] as const).map((tab) => <button key={tab} id={`${id}-${tab}-tab`} type="button" role="tab" aria-selected={value === tab} aria-controls={`${id}-${tab}`} tabIndex={value === tab ? 0 : -1} onClick={() => onChange(tab)} onKeyDown={(event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? "info" : event.key === "End" ? "output" : tab === "info" ? "output" : "info";
    onChange(next); document.getElementById(`${id}-${next}-tab`)?.focus();
  }} className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold ${value === tab ? "bg-bang text-tren-bang" : "text-muc-nhat"}`}>{tab === "info" ? "Thông tin" : "Bản soạn"}{tab === "output" && hasOutput ? " ✓" : ""}</button>)}</div>;
}

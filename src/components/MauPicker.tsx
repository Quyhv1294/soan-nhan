"use client";

import { useId, useState } from "react";
import { ChoiceGroup, Input } from "./ui";

export type LuaChonMau = { value: string; label: string; note: string; nhom: string };
const tim = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();

/** Small searchable catalogue; selecting a filter never changes the current document. */
export function MauPicker({ name, value, options, onChange }: { name: string; value: string; options: LuaChonMau[]; onChange: (value: string) => void }) {
  const [nhom, setNhom] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const id = useId();
  const shown = options.filter((o) => (nhom === "Tất cả" || o.nhom === nhom) && tim(`${o.label} ${o.note}`).includes(tim(query)));
  return <div className="space-y-3">
    <label className="block"><span className="sr-only">Tìm mẫu</span><Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Tìm trong ${options.length} mẫu…`} /></label>
    <div className="flex flex-wrap gap-2" aria-label="Nhóm mẫu">{["Tất cả", ...new Set(options.map((o) => o.nhom))].map((group) => <button key={group} type="button" aria-pressed={group === nhom} aria-controls={id} onClick={() => setNhom(group)} className={`min-h-10 rounded-o border px-3 text-sm font-semibold ${group === nhom ? "border-bang bg-bang-nhat text-bang" : "border-vien text-muc-nhat"}`}>{group}</button>)}</div>
    <p className="text-sm text-muc-nhat" aria-live="polite">Đang chọn: <strong className="text-muc">{options.find((o) => o.value === value)?.label}</strong> · {shown.length} mẫu hiển thị</p>
    <div id={id} className="max-h-[400px] overflow-y-auto p-1">
      {shown.length ? <ChoiceGroup name={name} value={value} options={shown} onValueChange={onChange} /> : <p className="py-4 text-sm text-muc-nhat">Chưa có mẫu phù hợp. Cô thử từ khóa khác nhé.</p>}
    </div>
  </div>;
}

"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { dungBangKeHoachThang, ngayDayDu, noiDungOThang, type OTrongBangThang } from "@/lib/bang-ke-hoach-thang";
import { NHOM_HOAT_DONG, type KeHoachThang } from "@/lib/types";

function ChuO({ cell }: { cell: OTrongBangThang }) {
  return <div className="space-y-1.5">{cell.dong.map((d, i) => <p key={i} className={`whitespace-pre-wrap break-words ${d.dam ? "font-semibold" : ""} ${d.nhe ? "text-sm text-muc-nhat" : ""}`}>{d.chu}</p>)}</div>;
}
function ThaoTacO({ cell, onEdit, onLesson }: { cell: OTrongBangThang; onEdit: (id: string) => void; onLesson: (id: string) => void }) {
  if (!cell.dich.length) return null;
  return <div className="mt-3 flex flex-wrap gap-1 border-t border-vien pt-2">
    <Button type="button" variant="nhe" onClick={() => onEdit(cell.chinhId ?? cell.dich[0].id)}>Chỉnh ô</Button>
    {cell.dich.length > 1 && <select className="min-h-11 max-w-full rounded-o border border-vien-nhap bg-trang px-2 text-base text-muc" aria-label="Chọn nội dung chung hoặc ngoại lệ để chỉnh" value="" onChange={(e) => { if (e.target.value) onEdit(e.target.value); }}><option value="">Chỉnh chung / ngoại lệ…</option>{cell.dich.map((d) => <option key={d.id} value={d.id}>{d.nhan}</option>)}</select>}
    {cell.giaoAnIds.map((id, index) => <Button key={id} type="button" variant="nhe" onClick={() => onLesson(id)}>Giáo án{cell.giaoAnIds.length > 1 ? ` ${index + 1}` : ""}</Button>)}
  </div>;
}

export function BangThang({ plan, onEdit, onLesson }: { plan: KeHoachThang; onEdit: (id: string) => void; onLesson: (id: string) => void }) {
  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const filter = plan.tuan.some((w) => w.id === selectedWeek) ? selectedWeek : "";
  const model = dungBangKeHoachThang(plan, filter || undefined);
  const count = filter ? 1 : plan.tuan.length;
  const week = plan.tuan.find((w) => w.id === filter) ?? plan.tuan[0];
  const day = week.ngay.find((d) => d.id === selectedDay) ?? week.ngay[0];
  return <section className="min-w-0 space-y-4" aria-label="Bảng kế hoạch tháng">
    <div className="hidden items-end justify-between gap-4 lg:flex">
      <div><h2 className="text-xl font-bold">Bảng kế hoạch tháng</h2><p className="mt-1 text-sm text-muc-nhat">Cuộn ngang để xem các tuần và mục tiêu. Bấm Chỉnh ô để sửa đúng nội dung gốc.</p></div>
      <div className="w-60 shrink-0"><Field label="Phạm vi xem"><select className="min-h-11 w-full rounded-o border border-vien-nhap bg-trang px-3 text-base" value={filter} onChange={(e) => setSelectedWeek(e.target.value)}><option value="">Toàn bộ tháng</option>{plan.tuan.map((w, index) => <option key={w.id} value={w.id}>Tuần {index + 1} · {w.tuNgay.slice(8, 10)}–{w.denNgay.slice(8, 10)}/{w.tuNgay.slice(5, 7)}</option>)}</select></Field></div>
    </div>
    <div className="bang-thang-cuon hidden max-h-[72vh] overflow-auto rounded-the border border-vien bg-trang lg:block" tabIndex={0} role="region" aria-label="Bảng tháng có thể cuộn ngang và dọc">
      <table className="w-full table-fixed border-separate border-spacing-0 text-base" style={{ minWidth: 180 + 64 + count * 260 + 300 }}>
        <caption className="sr-only">{model.tieuDe}. Nội dung chung có ô gộp; những ô riêng giữ ngày cụ thể.</caption>
        <colgroup><col style={{ width: 180 }} /><col style={{ width: 64 }} />{Array.from({ length: count }, (_, i) => <col key={i} style={{ width: 260 }} />)}<col style={{ width: 300 }} /></colgroup>
        <thead><tr>{model.cot.map((c, index) => <th key={index} colSpan={c.soCot} className={`sticky top-0 border-b border-r border-vien bg-bang-nhat p-3 text-left align-top ${index === 0 ? "left-0 z-30" : "z-20"}`}>{c.dong.map((d, i) => <p key={i} className={d.dam ? "font-bold" : "mt-1 text-sm font-normal"}>{d.chu}</p>)}</th>)}</tr></thead>
        <tbody>{model.hang.map((row) => <tr key={row.id}>{row.o.map((cell) => <td key={cell.cot} colSpan={cell.soCot} rowSpan={cell.soHang} className={`border-b border-r border-vien bg-trang p-3 align-top ${cell.loai === "nhom" ? "sticky left-0 z-10" : cell.loai === "thu" ? "sticky left-[180px] z-10" : ""}`}>
          {cell.loai === "muc-tieu" && cell.dong.some((d) => d.dam) ? <details><summary className="cursor-pointer font-semibold">{cell.dong.filter((d) => d.dam).map((d) => d.chu).join(", ")}</summary><div className="mt-3"><ChuO cell={cell} /></div></details> : <ChuO cell={cell} />}
          <ThaoTacO cell={cell} onEdit={onEdit} onLesson={onLesson} />
        </td>)}</tr>)}</tbody>
      </table>
    </div>
    <div className="space-y-4 lg:hidden">
      <Field label="Tuần đang xem"><select className="min-h-11 w-full rounded-o border border-vien-nhap bg-trang px-3 text-base" value={week.id} onChange={(e) => { setSelectedWeek(e.target.value); setSelectedDay(""); }}>{plan.tuan.map((w, index) => <option key={w.id} value={w.id}>Tuần {index + 1} · {ngayDayDu(w.tuNgay)}–{ngayDayDu(w.denNgay)}</option>)}</select></Field>
      <p className="font-semibold">{week.chuDe || "Chưa nhập chủ đề tuần"}</p>
      <div className="flex flex-wrap gap-2" aria-label="Chọn ngày học">{week.ngay.map((d) => <button key={d.id} type="button" aria-pressed={day.id === d.id} className={`min-h-11 rounded-o border px-3 text-base ${day.id === d.id ? "border-bang bg-bang text-tren-bang" : "border-vien bg-trang"}`} onClick={() => setSelectedDay(d.id)}>{ngayDayDu(d.ngay)}</button>)}</div>
      <p className="text-sm text-muc-nhat">Nội dung dưới đây đã kết hợp phần chung tháng, tuần và ngoại lệ của ngày đang chọn.</p>
      {NHOM_HOAT_DONG.map((g) => {
        const cell = noiDungOThang(plan, g.id, week, day);
        const goals = plan.boMucTieu?.mucTieu.filter((m) => cell.mucTieuIds.includes(m.id)) ?? [];
        return <section key={g.id} className="space-y-3 rounded-the border border-vien bg-trang p-4"><h3 className="font-bold">{g.ten}</h3><ChuO cell={cell} />{goals.length > 0 && <details><summary className="cursor-pointer text-sm font-semibold">Mô tả mục tiêu</summary>{goals.map((m) => <p key={m.id} className="mt-2 whitespace-pre-wrap text-sm text-muc-nhat"><b>{m.ma}:</b> {m.moTa}</p>)}</details>}<ThaoTacO cell={cell} onEdit={onEdit} onLesson={onLesson} /></section>;
      })}
    </div>
  </section>;
}

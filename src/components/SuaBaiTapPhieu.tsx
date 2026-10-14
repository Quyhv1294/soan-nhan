"use client";

import { useState } from "react";
import { Button, Field, Input, Select } from "./ui";
import { docBaiTapPhieuAi } from "@/lib/phieu-ai-data";
import { HINH_PHIEU, type BaiTapPhieuAi, type DongPhieuAi, type PhieuHocTap } from "@/lib/types";

const LABEL_HINH = ["Hình tròn", "Hình vuông", "Hình tam giác", "Ngôi sao", "Ngôi nhà", "Cái cây", "Bông hoa", "Con cá", "Ô tô"];
const LABEL_NET = ["Nét ngang", "Nét xiên", "Nét cong", "Nét gấp khúc"];
const NET = ["ngang", "xien", "cong", "gap-khuc"];
const fields: { key: keyof DongPhieuAi; label: string; kind: "text" | "number" | "list" | "hinh" | "net" | "phep"; max?: number }[] = [
  { key: "lenh", label: "Lời giao nhiệm vụ", kind: "text", max: 60 },
  { key: "hinh", label: "Hình minh họa / hình A", kind: "hinh" }, { key: "hinhB", label: "Hình B", kind: "hinh" },
  { key: "nhan", label: "Tên hình", kind: "text", max: 22 }, { key: "soLuong", label: "Số lượng hình", kind: "number" },
  { key: "luaChon", label: "Ba số lựa chọn (ngăn bằng dấu phẩy)", kind: "list" },
  { key: "day", label: "Dãy chữ/số (ngăn bằng dấu phẩy, để trống giữa hai dấu phẩy cho ô cần điền)", kind: "list" },
  { key: "chuMau", label: "Chữ mẫu", kind: "text", max: 1 }, { key: "net", label: "Loại nét", kind: "net" },
  { key: "benTrai", label: "Số hình bên trái", kind: "number" }, { key: "benPhai", label: "Số hình bên phải", kind: "number" },
  { key: "tong", label: "Tổng số", kind: "number" }, { key: "nhomMot", label: "Số cho trước của nhóm thứ nhất", kind: "number" },
  { key: "a", label: "Số thứ nhất", kind: "number" }, { key: "b", label: "Số thứ hai", kind: "number" }, { key: "phep", label: "Phép tính", kind: "phep" },
];

export function SuaBaiTapPhieu({ phieu, disabled, onApply }: { phieu: PhieuHocTap & { baiTapAi: BaiTapPhieuAi }; disabled: boolean; onApply: (ai: BaiTapPhieuAi) => void }) {
  const [title, setTitle] = useState(phieu.baiTapAi.tieuDe), [instruction, setInstruction] = useState(phieu.baiTapAi.huongDan);
  const [rows, setRows] = useState(() => phieu.baiTapAi.dong.map((d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v)]))));
  const [error, setError] = useState("");
  function apply() {
    try {
      const dong = rows.map((r) => Object.fromEntries(Object.entries(r).map(([key, value]) => {
        const kind = fields.find((f) => f.key === key)?.kind;
        return [key, kind === "number" ? value.trim() ? Number(value) : undefined : key === "luaChon" ? value.split(",").map((s) => s.trim() ? Number(s) : NaN) : kind === "list" ? value.split(",").map((s) => s.trim()) : value];
      })));
      const ai = docBaiTapPhieuAi({ tieuDe: title, huongDan: instruction, dong }, phieu.mau, phieu.tuyChinh);
      onApply(ai); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Cô kiểm tra lại nội dung bài tập nhé."); }
  }
  return <details className="rounded-o border border-vien p-4"><summary className="cursor-pointer font-semibold">Chỉnh sửa bài tập AI</summary><fieldset disabled={disabled} className="mt-4 space-y-4">
    <Field label="Tiêu đề phiếu"><Input value={title} maxLength={42} onChange={(e) => setTitle(e.target.value)} /></Field>
    <Field label="Hướng dẫn chung"><Input value={instruction} maxLength={85} onChange={(e) => setInstruction(e.target.value)} /></Field>
    {rows.map((row, i) => <fieldset key={i} className="space-y-3 border-t border-vien pt-3"><legend className="px-1 font-semibold">{phieu.mau === "tim-diem-khac" ? `Vị trí hình ${i + 1}` : `Bài ${i + 1}`}</legend>{fields.filter((f) => row[f.key] !== undefined && !(phieu.mau === "tim-diem-khac" && f.key === "lenh")).map((f) => {
      const value = row[f.key];
      const update = (v: string) => setRows((old) => old.map((r, j) => j === i ? { ...r, [f.key]: v } : r));
      return <Field key={f.key} label={f.label}>{f.kind === "hinh" ? <Select options={[...LABEL_HINH, ...(f.key === "hinhB" && phieu.mau === "tim-diem-khac" ? ["Ẩn hình"] : [])]} value={value === "khong" ? "Ẩn hình" : LABEL_HINH[HINH_PHIEU.indexOf(value as typeof HINH_PHIEU[number])]} onChange={(e) => update(e.target.value === "Ẩn hình" ? "khong" : HINH_PHIEU[LABEL_HINH.indexOf(e.target.value)])} /> : f.kind === "net" ? <Select options={LABEL_NET} value={LABEL_NET[NET.indexOf(value)]} onChange={(e) => update(NET[LABEL_NET.indexOf(e.target.value)])} /> : f.kind === "phep" ? <Select options={["+", "-"]} value={value} onChange={(e) => update(e.target.value)} /> : <Input type={f.kind === "number" ? "number" : "text"} min={0} max={99} value={value} maxLength={f.max ?? 100} onChange={(e) => update(e.target.value)} />}</Field>;
    })}</fieldset>)}
    <p className="text-sm text-muc-nhat">Bấm áp dụng để cập nhật bản xem và PDF. Phiếu vẫn giữ trống phần trả lời.</p>
    <Button type="button" variant="phu" onClick={apply}>Áp dụng chỉnh sửa</Button>{error && <p role="alert" className="text-sm text-butdo">{error}</p>}
  </fieldset></details>;
}

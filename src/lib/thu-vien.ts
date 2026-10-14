import type { TaiLieu } from "./types";
import { boLienKetGiaoAnThang, docKeHoachThang, saoChepKeHoachThang } from "./ke-hoach-thang";

export type SapXep = "moi-nhat" | "cu-nhat" | "ten";
export function chuanHoaTimKiem(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLocaleLowerCase("vi").trim(); }
export function timTaiLieu(items: TaiLieu[], q = "") {
  const words = chuanHoaTimKiem(q).split(/\s+/).filter(Boolean);
  return items.filter((x) => words.every((word) => chuanHoaTimKiem(`${x.tieuDe} ${x.chuDe}`).includes(word)));
}
export function sapXepTaiLieu(items: TaiLieu[], sort: SapXep) {
  return [...items].sort((a, b) => sort === "ten" ? a.tieuDe.localeCompare(b.tieuDe, "vi") || a.id.localeCompare(b.id) : (sort === "cu-nhat" ? 1 : -1) * (Date.parse(a.capNhat) - Date.parse(b.capNhat)) || a.id.localeCompare(b.id));
}
export function hrefThuVien({ q = "", loai = "", sort = "moi-nhat" }: { q?: string; loai?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (loai) params.set("loai", loai);
  if (sort !== "moi-nhat") params.set("sort", sort);
  return `/thu-vien${params.size ? `?${params}` : ""}`;
}
export function saoChepNoiDung(data: Record<string, unknown>, title: string) {
  const copied = data.phienBan !== undefined && Array.isArray(data.tuan) ? saoChepKeHoachThang(docKeHoachThang(data)) : structuredClone(data);
  const next = { ...copied, id: crypto.randomUUID(), _tieuDe: title };
  delete (next as Record<string, unknown>)._soanNhan;
  // Kế hoạch sao chép có các hoạt động riêng, cần soạn giáo án riêng cho tuần mới.
  if (Array.isArray(data.ngay)) (next as Record<string, unknown>).ngay = data.ngay.map((day) => ({ ...day, hoatDong: Array.isArray(day.hoatDong) ? day.hoatDong.map((activity: Record<string, unknown>) => { const { giaoAnId: _old, ...rest } = activity; return { ...rest, id: crypto.randomUUID() }; }) : [] }));
  return next;
}

// Cả API và kho demo bỏ cùng một loại liên kết; nội dung kế hoạch được giữ lại.
export function boLienKetGiaoAn(data: Record<string, unknown>, id: string): Record<string, unknown> {
  if (data.phienBan !== undefined && Array.isArray(data.tuan)) return boLienKetGiaoAnThang(docKeHoachThang(data), id) as unknown as Record<string, unknown>;
  if (!Array.isArray(data.ngay)) return data;
  let changed = false;
  const ngay = data.ngay.map((day) => ({ ...day, hoatDong: Array.isArray(day.hoatDong) ? day.hoatDong.map((activity: Record<string, unknown>) => {
    if (activity.giaoAnId !== id) return activity;
    changed = true;
    const { giaoAnId: _old, ...rest } = activity;
    return rest;
  }) : [] }));
  return changed ? { ...data, ngay } : data;
}

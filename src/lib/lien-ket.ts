import { DO_TUOI_LABEL, type HoatDongTrongNgay, type KeHoachTuan } from "./types";

// Đường dẫn sang trang soạn giáo án. Mang theo tên hoạt động, lĩnh vực, chủ đề, độ tuổi
// để biểu mẫu được điền sẵn, kể cả khi kế hoạch tuần do AI tạo (không có trong dữ liệu mẫu).
export function hrefSoanGiaoAn(t: KeHoachTuan, hd: HoatDongTrongNgay): string {
  const p = new URLSearchParams({ hoatDong: hd.id, ten: hd.ten, chuDe: t.chuDe, doTuoi: DO_TUOI_LABEL[t.doTuoi] });
  if (hd.linhVuc) p.set("linhVuc", hd.linhVuc);
  return `/giao-an/moi?${p.toString()}`;
}

export const hrefXemGiaoAn = (giaoAnId: string) => `/giao-an/moi?id=${encodeURIComponent(giaoAnId)}`;

// "19/10 – 23/10/2026" cho tuần bắt đầu từ ngày tuNgay (thứ Hai).
export function khoangNgay(tuNgay: string): string {
  const d = new Date(tuNgay);
  if (Number.isNaN(d.getTime())) return "";
  const cuoi = new Date(d);
  cuoi.setUTCDate(cuoi.getUTCDate() + 4);
  const ngayThang = (x: Date) => x.toLocaleDateString("vi-VN", { timeZone: "UTC", day: "numeric", month: "numeric" });
  return `${ngayThang(d)} – ${ngayThang(cuoi)}/${cuoi.getUTCFullYear()}`;
}

import { MOCK_TUAN } from "./mock-data";
import type { GiaoAnMamNon, KeHoachTuan } from "./types";
import type { TaiLieu } from "./types";
import { boLienKetGiaoAn, saoChepNoiDung } from "./thu-vien";
import { docKeHoachThang, ganGiaoAnThang, kiemTraGanTuDong, tieuDeKeHoachThang } from "./ke-hoach-thang";
import { docPhieu } from "./mau-phieu";
import { docTroChoi } from "./tro-choi";

// Kho tạm lưu trong trình duyệt (localStorage) cho đến khi nối Supabase:
// kế hoạch tuần hiện tại và các giáo án đã soạn. Chỉ gọi từ mã chạy trên trình duyệt.
// Mọi thao tác bọc try/catch vì localStorage có thể bị chặn (chế độ riêng tư) hoặc đầy.

const KHOA_TUAN = "soan-nhan:tuan";
const KHOA_TAI_LIEU = "soan-nhan:tai-lieu";
const KHOA_HO_SO = "soan-nhan:ho-so";
const khoaGiaoAn = (id: string) => `soan-nhan:giao-an:${id}`;

function doc<T>(khoa: string): T | null {
  try {
    const s = localStorage.getItem(khoa);
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}

function ghi(khoa: string, giaTri: unknown): boolean {
  try {
    localStorage.setItem(khoa, JSON.stringify(giaTri));
    return true;
  } catch {
    return false;
  }
}

export function docTuan(): KeHoachTuan | null {
  const t = doc<KeHoachTuan>(KHOA_TUAN);
  // Dữ liệu cũ hoặc bị sửa tay thì bỏ qua, tránh làm vỡ trang.
  return t && Array.isArray(t.ngay) && t.ngay.length === 5 && typeof t.chuDe === "string" ? t : null;
}

export const luuTuan = (t: KeHoachTuan) => ghi(KHOA_TUAN, t);

export function docGiaoAn(id: string): GiaoAnMamNon | null {
  const g = doc<GiaoAnMamNon>(khoaGiaoAn(id));
  return g && Array.isArray(g.tienHanh) && g.id === id ? g : null;
}

export const luuGiaoAn = (ga: GiaoAnMamNon) => ghi(khoaGiaoAn(ga.id), ga);

export function docTaiLieu(): TaiLieu[] {
  const value = doc<unknown>(KHOA_TAI_LIEU);
  const types = ["giao-an", "khbd", "phieu", "tro-choi", "tin-nhan", "ke-hoach-tuan", "ke-hoach-thang"];
  return Array.isArray(value) ? value.filter((item): item is TaiLieu => item && typeof item.id === "string" && types.includes(item.loai) && typeof item.tieuDe === "string" && typeof item.chuDe === "string" && typeof item.capNhat === "string") : [];
}

export function docNoiDung(id: string): Record<string, unknown> | null {
  return docTaiLieu().find((x) => x.id === id)?.noiDung ?? null;
}

export function lienKetGiaoAnLocal(planId: string, nhomId: string, lessonId: string | null, expectedId: string | null, tuDong = false) {
  const items = docTaiLieu();
  const item = items.find((d) => d.id === planId && d.loai === "ke-hoach-thang");
  if (!item?.noiDung) throw new Error("Kế hoạch tháng không còn trong thư viện này.");
  const plan = docKeHoachThang(item.noiDung);
  if (lessonId) {
    const lesson = items.find((d) => d.id === lessonId && d.loai === "giao-an")?.noiDung;
    if (!lesson || lesson.doTuoi !== plan.doTuoi) throw new Error("Giáo án không còn hoặc không cùng độ tuổi với kế hoạch.");
    if (tuDong) kiemTraGanTuDong(plan, nhomId, { id: lessonId, nguCanhKeHoach: lesson.nguCanhKeHoach });
  }
  const next = ganGiaoAnThang(plan, nhomId, lessonId, expectedId);
  if (next !== plan && !ghi(KHOA_TAI_LIEU, items.map((d) => d.id === planId ? { ...d, noiDung: next, capNhat: new Date().toISOString() } : d))) throw new Error("Chưa lưu được liên kết trên trình duyệt này.");
  return next;
}

export async function luuTaiLieu(loai: TaiLieu["loai"], data: Record<string, unknown>): Promise<string> {
  const validId = typeof data.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
  const payload = { ...data, id: validId ? data.id as string : crypto.randomUUID() };
  if (loai === "ke-hoach-thang") docKeHoachThang(payload);
  if (loai === "phieu") docPhieu(payload);
  if (loai === "tro-choi") docTroChoi(payload);
  let res: Response;
  try {
    res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loai, data: payload }) });
  } catch {
    throw new Error("Mất kết nối mạng, tài liệu chưa được lưu.");
  }
  const result = (await res.json().catch(() => null)) as { ok?: boolean; demo?: boolean; error?: string; id?: string } | null;
  if (!res.ok || !result?.ok) throw new Error(result?.error ?? "Chưa lưu được tài liệu.");
  if (result.demo) {
    const existingTitle = docTaiLieu().find((x) => x.id === payload.id)?.noiDung?._tieuDe;
    const title = String(existingTitle ?? data._tieuDe ?? (loai === "ke-hoach-thang" ? tieuDeKeHoachThang(docKeHoachThang(payload)) : undefined) ?? data.tenHoatDong ?? data.tenBai ?? data.chuDe ?? (loai === "tin-nhan" ? "Tin nhắn phụ huynh" : "Tài liệu mới"));
    if (existingTitle) Object.assign(payload, { _tieuDe: existingTitle });
    const current = docTaiLieu().filter((item) => item.id !== payload.id);
    current.unshift({ id: payload.id, loai, tieuDe: title, chuDe: String(data.chuDe ?? ""), capNhat: new Date().toISOString(), noiDung: payload });
    if (!ghi(KHOA_TAI_LIEU, current.slice(0, 200))) throw new Error("Trình duyệt không lưu được tài liệu. Bộ nhớ có thể đã đầy hoặc bị chặn.");
    if (loai === "giao-an") luuGiaoAn(payload as unknown as GiaoAnMamNon);
  }
  return result.id ?? payload.id;
}

export function docHoSo<T>(): T | null { return doc<T>(KHOA_HO_SO); }
export function luuHoSo(data: unknown) { return ghi(KHOA_HO_SO, data); }

export function thaoTacTaiLieuLocal(id: string, action: "rename" | "duplicate" | "delete", title?: string): TaiLieu | null {
  const items = docTaiLieu();
  const item = items.find((x) => x.id === id);
  if (!item) throw new Error("Tài liệu không còn trong thư viện. Cô tải lại danh sách nhé.");
  const now = new Date().toISOString();
  let next: TaiLieu | null = null;
  let updated: TaiLieu[];
  if (action === "rename") {
    if (!title?.trim() || title.trim().length > 200) throw new Error("Tên tài liệu cần từ 1 đến 200 ký tự.");
    next = { ...item, tieuDe: title.trim(), capNhat: now, noiDung: { ...item.noiDung, _tieuDe: title.trim() } };
    updated = items.map((x) => x.id === id ? next! : x);
  } else if (action === "duplicate") {
    if (!item.noiDung) throw new Error("Chưa có nội dung để nhân bản tài liệu.");
    if (items.length >= 200) throw new Error("Kho demo đã đủ 200 tài liệu. Cô xóa bớt trước khi nhân bản.");
    const name = `${item.tieuDe.slice(0, 188)} (bản sao)`;
    const data = saoChepNoiDung(item.noiDung, name);
    next = { ...item, id: data.id, tieuDe: name, capNhat: now, noiDung: data };
    updated = [next, ...items];
  } else {
    updated = items.filter((x) => x.id !== id).map((x) => {
      if (item.loai !== "giao-an" || !["ke-hoach-tuan", "ke-hoach-thang"].includes(x.loai) || !x.noiDung) return x;
      const content = boLienKetGiaoAn(x.noiDung, id);
      return content === x.noiDung ? x : { ...x, noiDung: content, capNhat: now };
    });
  }
  if (!ghi(KHOA_TAI_LIEU, updated)) throw new Error("Trình duyệt không lưu được thay đổi. Bộ nhớ có thể đầy hoặc bị chặn.");
  if (action === "delete") {
    xoaGiaoAn(id);
    const current = docTuan();
    if (current?.id === id) { try { localStorage.removeItem(KHOA_TUAN); } catch {} }
    else if (current && item.loai === "giao-an") {
      const saved = updated.find((x) => x.id === current.id)?.noiDung;
      if (saved) luuTuan(saved as unknown as KeHoachTuan);
    }
  }
  return next;
}

export function xoaGiaoAn(id: string) {
  try {
    localStorage.removeItem(khoaGiaoAn(id));
  } catch {
    /* bỏ qua */
  }
}

// Gắn giáo án vừa soạn vào ô "Hoạt động học" tương ứng của kế hoạch tuần.
// Chưa có kế hoạch nào được lưu thì dùng kế hoạch mẫu làm gốc, giống những gì trang Kế hoạch tuần đang hiện.
export function ganGiaoAnVaoTuan(hoatDongId: string, giaoAnId: string): boolean {
  const goc = docTuan() ?? MOCK_TUAN;
  let thay = false;
  const moi: KeHoachTuan = {
    ...goc,
    ngay: goc.ngay.map((n) => ({
      ...n,
      hoatDong: n.hoatDong.map((h) => {
        if (h.id !== hoatDongId) return h;
        thay = true;
        return { ...h, giaoAnId };
      }),
    })),
  };
  return thay && luuTuan(moi);
}

// Tìm ô hoạt động đang trỏ tới một giáo án (dùng khi soạn lại giáo án đã có).
export function timHoatDongTheoGiaoAn(giaoAnId: string): string | null {
  const t = docTuan() ?? MOCK_TUAN;
  return t.ngay.flatMap((n) => n.hoatDong).find((h) => h.giaoAnId === giaoAnId)?.id ?? null;
}

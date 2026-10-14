import { PHIEU_TIEU_DE, type MauPhieu, type PhieuHocTap } from "./types";
import { docBaiTapPhieuAi } from "./phieu-ai-data";
export { CHU_CAI_VIET } from "./chu-cai";
import { CHU_CAI_VIET } from "./chu-cai";

export const BO_MAU_PHIEU: { value: MauPhieu; label: string; note: string; nhom: string }[] = [
  { value: "to-mau", label: "Tô màu", note: "Mầm non · 4 tranh nét viền", nhom: "Quan sát & nét" },
  { value: "noi-hinh", label: "Nối hình", note: "Mầm non · nối hình với tên gọi, cô đọc cùng bé", nhom: "Quan sát & nét" },
  { value: "tim-diem-khac", label: "Tìm điểm khác", note: "Mầm non · tìm 5 điểm khác giữa hai tranh", nhom: "Quan sát & nét" },
  { value: "to-net", label: "Làm quen các nét", note: "Mầm non · nét ngang, xiên, cong và gấp khúc", nhom: "Quan sát & nét" },
  { value: "tim-chu", label: "Tìm chữ cái", note: "Mầm non lớn, lớp 1 · khoanh chữ theo mẫu", nhom: "Chữ cái" },
  { value: "to-chu", label: "Tô chữ cái", note: "Mầm non lớn, lớp 1 · tô nét viền chữ đã chọn", nhom: "Chữ cái" },
  { value: "dem-khoanh", label: "Đếm và khoanh số", note: "Mầm non · đếm nhóm hình trong phạm vi 3–10", nhom: "Toán" },
  { value: "dien-chu-so", label: "Điền chữ, số", note: "Mầm non lớn, lớp 1 · điền phần còn thiếu", nhom: "Toán" },
  { value: "quy-luat", label: "Tìm quy luật", note: "Mầm non · lặp hình theo AB, AAB hoặc ABB", nhom: "Toán" },
  { value: "so-sanh", label: "So sánh số lượng", note: "Lớp 1 · đếm và điền dấu >, < hoặc =", nhom: "Toán" },
  { value: "tach-gop", label: "Tách và gộp", note: "Mầm non lớn, lớp 1 · hoàn thành hai nhóm", nhom: "Toán" },
  { value: "cong-tru", label: "Cộng, trừ có hình", note: "Lớp 1 · tính với các nhóm hình minh họa", nhom: "Toán" },
];
export const DUNG_PHAM_VI: MauPhieu[] = ["dem-khoanh", "so-sanh", "tach-gop", "cong-tru"];
export const DUNG_CHU_CAI: MauPhieu[] = ["tim-chu", "to-chu"];

export function docPhieu(value: unknown): PhieuHocTap {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Phiếu học tập chưa hợp lệ.");
  const p = value as PhieuHocTap;
  if (!Object.hasOwn(PHIEU_TIEU_DE, p.mau) || typeof p.chuDe !== "string" || p.chuDe.length > 100 || (p.noiDung !== undefined && (typeof p.noiDung !== "string" || p.noiDung.length > 140))) throw new TypeError("Mẫu, chủ đề hoặc ghi chú của phiếu chưa hợp lệ.");
  const c = p.tuyChinh;
  if (p.doTuoi !== undefined && (typeof p.doTuoi !== "string" || p.doTuoi.length > 100)) throw new TypeError("Độ tuổi trên phiếu chưa hợp lệ.");
  if (c !== undefined) {
    if (!c || typeof c !== "object" || Array.isArray(c)) throw new TypeError("Tùy chỉnh phiếu chưa hợp lệ.");
    if (c.phamVi !== undefined && (!Number.isInteger(c.phamVi) || c.phamVi < 3 || c.phamVi > 10)) throw new TypeError("Phạm vi số cần từ 3 đến 10.");
    if (c.quyLuat !== undefined && !["AB", "AAB", "ABB"].includes(c.quyLuat)) throw new TypeError("Quy luật chưa hợp lệ.");
    if (c.chuCai !== undefined && (!Array.isArray(c.chuCai) || c.chuCai.length < 1 || c.chuCai.length > 6 || c.chuCai.some((x) => typeof x !== "string" || !CHU_CAI_VIET.includes(x)))) throw new TypeError("Cô chọn từ 1 đến 6 chữ cái tiếng Việt viết thường.");
  }
  if (p.baiTapAi !== undefined) return { ...p, baiTapAi: docBaiTapPhieuAi(p.baiTapAi, p.mau, p.tuyChinh) };
  return p;
}

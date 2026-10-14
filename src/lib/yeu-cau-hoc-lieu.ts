import { BO_MAU_PHIEU, CHU_CAI_VIET } from "./mau-phieu";
import { laMauTroChoi } from "./tro-choi";
import { DO_TUOI_LABEL, type PhieuHocTap } from "./types";

export const LUA_TUOI_HOC_LIEU = [...Object.values(DO_TUOI_LABEL), "Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];
export function docYeuCauHocLieu(loai: "phieu" | "tro-choi", input: Record<string, string>) {
  if (!input.chuDe?.trim() || input.chuDe.length > 100) throw new TypeError("Cô nhập chủ đề từ 1 đến 100 ký tự trước khi tạo bằng AI.");
  if (!LUA_TUOI_HOC_LIEU.includes(input.doTuoi)) throw new TypeError("Cô chọn độ tuổi hoặc lớp phù hợp.");
  const mau = input.mau ?? "tu-dong";
  if (mau !== "tu-dong" && !(loai === "phieu" ? BO_MAU_PHIEU.some((m) => m.value === mau) : laMauTroChoi(mau))) throw new TypeError("Dạng bài tập hoặc trò chơi chưa hợp lệ.");
  const soLuong = Number(input.soLuong ?? "6");
  if (loai === "tro-choi" && (!Number.isInteger(soLuong) || soLuong < 3 || soLuong > 10)) throw new TypeError("AI có thể tạo từ 3 đến 10 câu/cặp/bước mỗi lượt.");
  const phamVi = Number(input.phamVi ?? "7");
  if (!Number.isInteger(phamVi) || phamVi < 3 || phamVi > 10) throw new TypeError("Phạm vi số cần từ 3 đến 10.");
  const chuCai = (input.chuCai ?? "a,ă,â,e,ê").split(/[\s,;]+/).filter(Boolean);
  if (chuCai.length < 1 || chuCai.length > 6 || chuCai.some((c) => !CHU_CAI_VIET.includes(c)) || new Set(chuCai).size !== chuCai.length) throw new TypeError("Chọn 1–6 chữ cái tiếng Việt khác nhau.");
  const quyLuat = input.quyLuat ?? "ABB";
  if (!["AB", "AAB", "ABB"].includes(quyLuat)) throw new TypeError("Quy luật chưa hợp lệ.");
  const tuyChinh: NonNullable<PhieuHocTap["tuyChinh"]> = { phamVi, chuCai, quyLuat: quyLuat as "AB" | "AAB" | "ABB" };
  return { mau, chuDe: input.chuDe.trim(), doTuoi: input.doTuoi, soLuong, tuyChinh };
}

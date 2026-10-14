import { SaiKhuon } from "./ai";
import { BO_MAU_PHIEU, docPhieu } from "./mau-phieu";
import { BO_MAU_TRO_CHOI, docNoiDungChoi, docTroChoi, laMauTroChoi } from "./tro-choi";
import { docBaiTapPhieuAi } from "./phieu-ai-data";
import { docYeuCauHocLieu } from "./yeu-cau-hoc-lieu";
import { HINH_PHIEU, type MauPhieu } from "./types";

const chu = { type: "string" }, so = { type: "integer" };
const net = { type: "string", enum: ["ngang", "xien", "cong", "gap-khuc"] };
const hinh = { type: "string", enum: [...HINH_PHIEU] };
const properties = {
  lenh: chu, hinh, nhan: chu, soLuong: so, luaChon: { type: "array", items: so }, day: { type: "array", items: chu }, chuMau: chu, net,
  hinhB: { type: "string", enum: [...HINH_PHIEU, "khong"] }, benTrai: so, benPhai: so, tong: so, nhomMot: so, a: so, b: so, phep: { type: "string", enum: ["+", "-"] },
};
export function hocLieuSchema(loai: "phieu" | "tro-choi", mau: string) {
  const modes = loai === "phieu" ? BO_MAU_PHIEU : BO_MAU_TRO_CHOI;
  return loai === "tro-choi" ? {
    type: "object", properties: { mau: { type: "string", enum: mau === "tu-dong" ? modes.map((m) => m.value) : [mau] }, ten: chu, noiDung: chu }, required: ["mau", "ten", "noiDung"],
  } : {
    type: "object", properties: {
      mau: { type: "string", enum: mau === "tu-dong" ? modes.map((m) => m.value) : [mau] }, tieuDe: chu, huongDan: chu,
      dong: { type: "array", items: { type: "object", properties, required: ["lenh"] } },
    }, required: ["mau", "tieuDe", "huongDan", "dong"],
  };
}

export function kiemTraHocLieu(raw: unknown, loai: "phieu" | "tro-choi", input: Record<string, string>) {
  try {
    const request = docYeuCauHocLieu(loai, input);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new TypeError("AI cần trả về một bộ nội dung.");
    const r = raw as Record<string, unknown>;
    if (request.mau !== "tu-dong" && r.mau !== request.mau) throw new TypeError("AI đã đổi mẫu cô chọn.");
    if (loai === "tro-choi") {
      if (!laMauTroChoi(r.mau) || typeof r.ten !== "string" || !r.ten.trim() || r.ten.length > 100) throw new TypeError("Tên hoặc dạng trò chơi chưa đúng.");
      const data = docTroChoi({ mau: r.mau, noiDung: r.noiDung, chuDe: r.ten.trim() });
      const parsed = docNoiDungChoi(data.mau, data.noiDung);
      if (parsed.muc.length !== request.soLuong) throw new TypeError("Số câu/cặp/bước chưa đúng yêu cầu.");
      if (data.noiDung.slice(0, 1500) === input.banTruoc) throw new TypeError("AI đã lặp lại toàn bộ nội dung trước.");
      return { ...data, doTuoi: request.doTuoi, chuDeAi: request.chuDe };
    }
    if (!BO_MAU_PHIEU.some((m) => m.value === r.mau)) throw new TypeError("Dạng phiếu AI chọn chưa hợp lệ.");
    const mau = r.mau as MauPhieu;
    const baiTapAi = docBaiTapPhieuAi(r, mau, request.tuyChinh);
    if (JSON.stringify(baiTapAi).slice(0, 1500) === input.banTruoc) throw new TypeError("AI đã lặp lại toàn bộ bài tập trước.");
    return docPhieu({ mau, chuDe: request.chuDe, doTuoi: request.doTuoi, tuyChinh: request.tuyChinh, baiTapAi });
  } catch (e) { throw new SaiKhuon(e instanceof Error ? e.message : "Nội dung học liệu chưa đúng khuôn."); }
}

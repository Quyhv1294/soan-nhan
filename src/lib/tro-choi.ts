import type { MauTroChoi } from "./types";

export const BO_MAU_TRO_CHOI: { value: MauTroChoi; label: string; note: string; nhom: string; hint: string }[] = [
  { value: "vong-quay", label: "Vòng quay gọi tên", note: "Chọn ngẫu nhiên một tên hoặc nhiệm vụ", nhom: "Khởi động", hint: "Mỗi dòng một tên hoặc nhiệm vụ; từ 2 đến 40 dòng." },
  { value: "lat-the", label: "Lật thẻ ghép đôi", note: "Tìm hai thẻ tương ứng; 2–12 cặp", nhom: "Ghi nhớ", hint: "Mỗi dòng: nội dung thứ nhất | nội dung ghép đôi. Dấu gạch ngang của mẫu cũ vẫn dùng được." },
  { value: "ai-nhanh-hon", label: "Ai nhanh hơn", note: "Câu hỏi mở, cô bấm để hiện đáp án", nhom: "Hỏi đáp", hint: "Mỗi dòng: câu hỏi | đáp án gợi ý. Tối đa 20 câu." },
  { value: "trac-nghiem", label: "Chọn đáp án đúng", note: "2–4 lựa chọn, phản hồi và tổng kết điểm", nhom: "Hỏi đáp", hint: "Mỗi dòng: Câu hỏi | *Đáp án đúng | Đáp án khác. Đặt * trước đúng một lựa chọn; 2–4 lựa chọn, tối đa 20 câu." },
  { value: "dung-sai", label: "Đúng hay sai?", note: "Chọn đúng/sai cho mỗi nhận định", nhom: "Hỏi đáp", hint: "Mỗi dòng: nhận định | đúng (hoặc sai). Tối đa 20 nhận định." },
  { value: "o-cua-bi-mat", label: "Ô cửa bí mật", note: "Chọn ô số, khám phá câu hỏi bên trong", nhom: "Ghi nhớ", hint: "Mỗi dòng: câu hỏi | đáp án. Mỗi câu là một ô cửa; tối đa 12 ô." },
  { value: "sap-xep", label: "Sắp xếp thứ tự", note: "Bấm các thẻ theo thứ tự; có kiểm tra kết quả", nhom: "Tư duy", hint: "Nhập 3–10 bước, mỗi dòng một bước theo thứ tự đúng. Khi chơi, các thẻ được xáo trộn." },
];
export const laMauTroChoi = (v: unknown): v is MauTroChoi => BO_MAU_TRO_CHOI.some((m) => m.value === v);
export const tenTroChoi = (mau: MauTroChoi) => BO_MAU_TRO_CHOI.find((m) => m.value === mau)!.label;
export type CauDap = { cau: string; dapAn: string };
export type CauChon = { cau: string; luaChon: string[]; dung: number };
export type BoChoi =
  | { loai: "vong-quay" | "sap-xep"; muc: string[] }
  | { loai: "lat-the" | "ai-nhanh-hon" | "o-cua-bi-mat"; muc: CauDap[] }
  | { loai: "trac-nghiem"; muc: CauChon[] }
  | { loai: "dung-sai"; muc: { cau: string; dung: boolean }[] };

/** Parse every line, reporting mistakes instead of silently dropping teacher content. */
export function docNoiDungChoi(mau: MauTroChoi, noiDung: string): BoChoi {
  if (!laMauTroChoi(mau) || typeof noiDung !== "string" || noiDung.length > 12000) throw new TypeError("Nội dung trò chơi chưa hợp lệ (tối đa 12.000 ký tự).");
  const lines = noiDung.split(/\r?\n/).map((s, i) => ({ text: s.trim(), line: i + 1 })).filter((s) => s.text);
  const max = mau === "vong-quay" ? 40 : mau === "sap-xep" ? 10 : ["lat-the", "o-cua-bi-mat"].includes(mau) ? 12 : 20;
  const min = mau === "sap-xep" ? 3 : ["lat-the", "vong-quay"].includes(mau) ? 2 : 1;
  if (lines.length < min || lines.length > max) throw new TypeError(`Mẫu này cần từ ${min} đến ${max} dòng nội dung.`);
  const fail = (line: number, message: string): never => { throw new TypeError(`Dòng ${line}: ${message}`); };
  if (mau === "vong-quay" || mau === "sap-xep") {
    const muc = lines.map(({ text, line }) => text.length <= 100 ? text : fail(line, "nội dung cần tối đa 100 ký tự."));
    if (mau === "sap-xep" && new Set(muc).size !== muc.length) throw new TypeError("Các bước sắp xếp cần khác nhau để bé phân biệt được thứ tự.");
    return { loai: mau, muc };
  }
  const parsed = lines.map(({ text, line }) => {
    const separator = /\s*[–—-]\s*/.exec(text);
    const parts = text.includes("|") ? text.split("|").map((s) => s.trim()) : separator ? [text.slice(0, separator.index).trim(), text.slice(separator.index + separator[0].length).trim()] : [text];
    if (parts.some((s) => !s || s.length > 160)) fail(line, "mỗi phần cần từ 1 đến 160 ký tự.");
    return { parts, line };
  });
  if (mau === "trac-nghiem") return { loai: mau, muc: parsed.map(({ parts, line }) => {
    const [cau, ...choices] = parts;
    if (choices.length < 2 || choices.length > 4 || choices.filter((s) => s.startsWith("*")).length !== 1) fail(line, "cần 2–4 lựa chọn và đánh dấu * trước đúng một đáp án.");
    const luaChon = choices.map((s) => s.replace(/^\*/, "").trim());
    if (luaChon.some((s) => !s) || new Set(luaChon).size !== luaChon.length) fail(line, "các đáp án cần khác nhau và không để trống.");
    return { cau, luaChon, dung: choices.findIndex((s) => s.startsWith("*")) };
  }) };
  if (mau === "dung-sai") return { loai: mau, muc: parsed.map(({ parts, line }) => {
    if (parts.length !== 2 || !["đúng", "sai"].includes(parts[1].toLowerCase())) fail(line, "dùng mẫu: nhận định | đúng (hoặc sai).");
    return { cau: parts[0], dung: parts[1].toLowerCase() === "đúng" };
  }) };
  return { loai: mau, muc: parsed.map(({ parts, line }) => {
    if (parts.length !== 2) fail(line, "cần hai phần: câu hỏi hoặc thẻ thứ nhất | đáp án hoặc thẻ thứ hai.");
    if (mau === "lat-the" && parts[0] === parts[1]) fail(line, "hai thẻ cần có nội dung phân biệt được.");
    return { cau: parts[0], dapAn: parts[1] };
  }) };
}

export function docTroChoi(value: unknown): { mau: MauTroChoi; noiDung: string; chuDe: string } {
  if (!value || typeof value !== "object") throw new TypeError("Trò chơi chưa hợp lệ.");
  const v = value as Record<string, unknown>;
  if (!laMauTroChoi(v.mau) || typeof v.noiDung !== "string") throw new TypeError("Mẫu hoặc nội dung trò chơi chưa hợp lệ.");
  docNoiDungChoi(v.mau, v.noiDung);
  if (v.chuDe !== undefined && (typeof v.chuDe !== "string" || v.chuDe.length > 100)) throw new TypeError("Tên trò chơi cần tối đa 100 ký tự.");
  return { mau: v.mau, noiDung: v.noiDung, chuDe: typeof v.chuDe === "string" ? v.chuDe : tenTroChoi(v.mau) };
}

export const CHU_DE_CHOI = ["Bản thân & thói quen", "Số & hình", "Chữ cái"] as const;
export type ChuDeChoi = typeof CHU_DE_CHOI[number];
export const NOI_DUNG_MAU: Record<ChuDeChoi, Record<MauTroChoi, string>> = {
  "Bản thân & thói quen": {
    "vong-quay": "Vẫy tay chào cả lớp\nNói tên một bộ phận cơ thể\nLàm động tác đánh răng\nKể một việc bé tự làm được\nHát một câu bé thích\nGiơ tay trái lên",
    "lat-the": "Mắt | Nhìn\nTai | Nghe\nMũi | Ngửi\nLưỡi | Nếm",
    "ai-nhanh-hon": "Bé dùng gì để nghe? | Tai\nTrước khi ăn bé cần làm gì? | Rửa tay\nKhi được giúp đỡ bé nói gì? | Cảm ơn\nBé dùng gì để nhìn? | Mắt",
    "trac-nghiem": "Bé dùng gì để nghe? | Mắt | *Tai | Mũi\nTrước khi ăn, bé nên làm gì? | *Rửa tay | Chơi đất\nKhi được giúp đỡ, bé nói gì? | *Cảm ơn | Không nói gì",
    "dung-sai": "Mắt giúp bé nhìn đồ vật | đúng\nBé nên ăn khi tay còn bẩn | sai\nBé bỏ rác vào thùng rác | đúng\nTai giúp bé ngửi mùi hoa | sai",
    "o-cua-bi-mat": "Kể tên hai bộ phận cơ thể | Ví dụ: tay, chân\nBé nói gì khi làm bạn buồn? | Xin lỗi\nLàm động tác rửa tay | Cô quan sát động tác của bé\nKể một việc bé tự phục vụ | Ví dụ: cất dép, cất đồ chơi\nBé chào ai khi đến lớp? | Cô giáo và các bạn\nHãy mỉm cười với cả lớp | Cô cùng cả lớp hưởng ứng",
    "sap-xep": "Làm ướt tay\nLấy xà phòng\nXoa kỹ hai bàn tay\nRửa sạch bằng nước\nLau khô tay",
  },
  "Số & hình": {
    "vong-quay": "Tìm một vật hình tròn\nĐếm 5 ngón tay\nVỗ tay 3 lần\nTìm một vật hình vuông\nGiơ 2 ngón tay\nĐếm từ 1 đến 7",
    "lat-the": "Một | 1\nHai | 2\nBa | 3\nBốn | 4\nNăm | 5\nSáu | 6",
    "ai-nhanh-hon": "Số nào liền sau số 4? | 5\nHình tam giác có mấy cạnh? | 3 cạnh\nTách 7 thành 3 và mấy? | 4\nHình vuông có mấy cạnh? | 4 cạnh",
    "trac-nghiem": "Số nào liền sau số 4? | 3 | *5 | 6\nHình tam giác có mấy cạnh? | *3 | 4 | 5\n3 cộng 2 bằng mấy? | 4 | *5 | 6\nTách 7 thành 3 và mấy? | *4 | 5 | 2",
    "dung-sai": "Hình tam giác có 3 cạnh | đúng\n2 cộng 3 bằng 6 | sai\n7 lớn hơn 5 | đúng\nHình tròn có 4 góc | sai",
    "o-cua-bi-mat": "Tìm một vật hình tròn trong lớp | Cô kiểm tra vật bé chỉ\nVỗ tay 4 lần | Cô cùng cả lớp đếm\nTách 7 thành 2 và mấy? | 5\nĐếm ngược từ 5 về 1 | 5, 4, 3, 2, 1\nSố nào đứng giữa 3 và 5? | 4\nHình vuông có bao nhiêu góc? | 4 góc",
    "sap-xep": "1\n2\n3\n4\n5\n6\n7",
  },
  "Chữ cái": {
    "vong-quay": "Tìm chữ a\nĐọc chữ ă\nTìm chữ â\nĐọc chữ e\nTìm chữ ê\nNói một từ có tiếng bắt đầu bằng b",
    "lat-the": "a | A\nă | Ă\nâ | Â\ne | E\nê | Ê",
    "ai-nhanh-hon": "Chữ nào có dấu mũ: a hay â? | â\nChữ nào có dấu trăng: a hay ă? | ă\nChữ E viết thường là gì? | e\nChữ Ê viết thường là gì? | ê",
    "trac-nghiem": "Chữ nào có dấu mũ? | a | ă | *â\nChữ nào có dấu trăng? | *ă | a | â\nChữ E viết thường là gì? | *e | ê | a\nChữ Â viết thường là gì? | ă | *â | a",
    "dung-sai": "Chữ â có dấu mũ | đúng\nChữ a có dấu trăng | sai\nChữ Ă viết thường là ă | đúng\nChữ E viết thường là ê | sai",
    "o-cua-bi-mat": "Đọc chữ a | a\nĐọc chữ ă | ă\nĐọc chữ â | â\nĐọc chữ e | e\nĐọc chữ ê | ê\nTìm chữ A trong lớp | Cô kiểm tra chữ bé tìm",
    "sap-xep": "a\nă\nâ\nb\nc\nd\nđ\ne\nê",
  },
};

export function xaoTron<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}

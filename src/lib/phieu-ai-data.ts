import { CHU_CAI_VIET } from "./chu-cai";
import { HINH_PHIEU, type BaiTapPhieuAi, type DongPhieuAi, type MauPhieu, type PhieuHocTap } from "./types";

const obj = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new TypeError("Bài tập cần đúng định dạng.");
  return v as Record<string, unknown>;
};
const chu = (v: unknown, max: number): string => {
  if (typeof v !== "string" || !v.trim() || v.trim().length > max || /[\r\n]/.test(v)) throw new TypeError(`Nội dung bài tập cần từ 1 đến ${max} ký tự, trên một dòng.`);
  return v.trim();
};
const so = (v: unknown, max = 10, min = 0): number => {
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) throw new TypeError(`Số trong bài tập cần từ ${min} đến ${max}.`);
  return v;
};
const hinh = (v: unknown) => {
  if (!HINH_PHIEU.includes(v as typeof HINH_PHIEU[number])) throw new TypeError("Hình minh họa chưa được hỗ trợ.");
  return v as typeof HINH_PHIEU[number];
};

/** Whitelist structured exercises only. AI cannot supply SVG/HTML or completed answers. */
export function docBaiTapPhieuAi(value: unknown, mau: MauPhieu, settings?: PhieuHocTap["tuyChinh"]): BaiTapPhieuAi {
  const v = obj(value), tieuDe = chu(v.tieuDe, 42), huongDan = chu(v.huongDan, 85);
  const count = mau === "tim-diem-khac" ? 6 : 4;
  if (!Array.isArray(v.dong) || v.dong.length !== count) throw new TypeError(`Phiếu này cần đúng ${count} dòng bài tập.`);
  const range = settings?.phamVi ?? (mau === "dem-khoanh" ? 5 : 7);
  const allowed = settings?.chuCai ?? ["a", "ă", "â", "e", "ê"];
  const dong = v.dong.map((raw): DongPhieuAi => {
    const d = obj(raw), base = { lenh: chu(d.lenh, 60) };
    switch (mau) {
      case "to-mau": case "noi-hinh": return { ...base, hinh: hinh(d.hinh), nhan: chu(d.nhan, 22) };
      case "dem-khoanh": {
        const n = so(d.soLuong, range, 1);
        if (!Array.isArray(d.luaChon) || d.luaChon.length !== 3) throw new TypeError("Mỗi bài đếm cần ba lựa chọn.");
        const choices = d.luaChon.map((n) => so(n, range));
        if (new Set(choices).size !== 3 || !choices.includes(n)) throw new TypeError("Lựa chọn của bài đếm chưa khớp số hình.");
        return { ...base, hinh: hinh(d.hinh), soLuong: n, luaChon: choices };
      }
      case "dien-chu-so": {
        if (!Array.isArray(d.day) || d.day.length !== 5 || d.day.some((s) => typeof s !== "string" || !/^(?:\d{1,2}|[aăâbcdđeêghiklmnoôơpqrstuưvxyAĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY])?$/.test(s)) || !d.day.includes("") || d.day.filter(Boolean).length < 3) throw new TypeError("Dãy điền cần 5 ô chữ/số, ít nhất 3 ô gợi ý và 1 ô trống.");
        const known = (d.day as string[]).map((s, i) => ({ s, i })).filter((x) => x.s);
        const numeric = known.every((x) => /^\d+$/.test(x.s));
        if (!numeric && known.some((x) => !CHU_CAI_VIET.includes(x.s.toLowerCase()))) throw new TypeError("Dãy cần chỉ gồm số hoặc chỉ gồm chữ cái.");
        const values = known.map((x) => ({ i: x.i, n: numeric ? Number(x.s) : CHU_CAI_VIET.indexOf(x.s.toLowerCase()) }));
        const step = (values[1].n - values[0].n) / (values[1].i - values[0].i), start = values[0].n - values[0].i * step;
        const end = start + 4 * step, max = numeric ? 99 : CHU_CAI_VIET.length - 1;
        if (!Number.isInteger(step) || !step || values.some((x) => x.n !== start + x.i * step) || Math.min(start, end) < 0 || Math.max(start, end) > max) throw new TypeError("Dãy chữ/số cần cách đều, xác định được ô còn thiếu và nằm trong phạm vi hợp lệ.");
        return { ...base, day: d.day as string[] };
      }
      case "to-net": {
        if (!["ngang", "xien", "cong", "gap-khuc"].includes(String(d.net))) throw new TypeError("Nét vẽ chưa hợp lệ.");
        return { ...base, net: d.net as DongPhieuAi["net"] };
      }
      case "tim-chu": case "to-chu": {
        const c = chu(d.chuMau, 1);
        if (!allowed.includes(c)) throw new TypeError("Bài tập có chữ ngoài các chữ cô chọn.");
        if (mau === "to-chu") return { ...base, chuMau: c };
        if (!Array.isArray(d.day) || d.day.length !== 8 || d.day.some((x) => typeof x !== "string" || !CHU_CAI_VIET.includes(x)) || d.day.filter((x) => x === c).length < 2 || d.day.every((x) => x === c)) throw new TypeError("Dòng tìm chữ cần 8 chữ, có ít nhất hai chữ mục tiêu và chữ khác.");
        return { ...base, chuMau: c, day: d.day as string[] };
      }
      case "quy-luat": {
        const a = hinh(d.hinh), b = hinh(d.hinhB);
        if (a === b) throw new TypeError("Quy luật cần hai hình khác nhau.");
        return { ...base, hinh: a, hinhB: b };
      }
      case "so-sanh": return { ...base, hinh: hinh(d.hinh), benTrai: so(d.benTrai, range, 1), benPhai: so(d.benPhai, range, 1) };
      case "tach-gop": {
        const total = so(d.tong, range, 3);
        if (total !== range) throw new TypeError("Tổng tách gộp phải đúng số cô chọn.");
        return { ...base, hinh: hinh(d.hinh), tong: total, nhomMot: so(d.nhomMot, total - 1, 1) };
      }
      case "cong-tru": {
        const a = so(d.a, range, 1), b = so(d.b, range, 1);
        if (!["+", "-"].includes(String(d.phep)) || (d.phep === "+" ? a + b > range : a - b < 0)) throw new TypeError("Phép tính vượt phạm vi hoặc có kết quả âm.");
        return { ...base, hinh: hinh(d.hinh), a, b, phep: d.phep as "+" | "-" };
      }
      case "tim-diem-khac": return { ...base, hinh: hinh(d.hinh), hinhB: d.hinhB === "khong" ? "khong" : hinh(d.hinhB) };
    }
  });
  if (mau === "tim-diem-khac" && dong.filter((d) => d.hinh !== d.hinhB).length !== 5) throw new TypeError("Hai tranh cần đúng 5 vị trí khác nhau.");
  if (mau === "noi-hinh" && (new Set(dong.map((d) => d.nhan)).size !== 4 || new Set(dong.map((d) => d.hinh)).size !== 4)) throw new TypeError("Bài nối hình cần bốn hình và tên phân biệt được.");
  return { tieuDe, huongDan, dong };
}

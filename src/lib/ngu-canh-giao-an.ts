import { DO_TUOI_LABEL, LINH_VUC, type NguCanhGiaoAnThang } from "./types";
import { docTietHoc, LOAI_TIET, nhanMucTieu, TINH_TRANG_TIET } from "./muc-tieu";
import { laNgay } from "./ke-hoach-thang";

// Demo lưu kế hoạch tại trình duyệt nên gửi bản chụp đúng ô. Tài khoản thật
// luôn lấy bản kế hoạch thuộc chủ sở hữu từ database, không tin bản chụp client.
export function docNguCanhDemo(raw: unknown): NguCanhGiaoAnThang {
  const v = raw as NguCanhGiaoAnThang;
  const uuid = (s: unknown) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const chu = (s: unknown, max: number, required = true) => typeof s === "string" && s.length <= max && (!required || Boolean(s.trim()));
  if (!v || typeof v !== "object" || Array.isArray(v) || !uuid(v.keHoachId) || !uuid(v.nhomId) || !chu(v.thang, 7) || !laNgay(`${v.thang}-01`) || !chu(v.chuDe, 200) || typeof v.doTuoi !== "string" || !Object.hasOwn(DO_TUOI_LABEL, v.doTuoi) || (v.ngay !== undefined && (!laNgay(v.ngay) || !v.ngay.startsWith(`${v.thang}-`)))) throw new Error("Ngữ cảnh kế hoạch demo chưa hợp lệ.");
  docTietHoc(v.tietHoc);
  if (!Array.isArray(v.phan) || !v.phan.length || v.phan.length > 150 || v.phan.some((p) => !p || !chu(p.tieuDe, 200, false) || !chu(p.noiDung, 20_000))) throw new Error("Nội dung ô kế hoạch demo chưa hợp lệ.");
  if (!Array.isArray(v.mucTieu) || v.mucTieu.length > 200 || v.mucTieu.some((m) => !m || !uuid(m.id) || !chu(m.ma, 40) || !chu(m.chiTieu, 100, false) || !chu(m.moTa, 6000) || (m.linhVuc !== undefined && !LINH_VUC.includes(m.linhVuc))) || new Set(v.mucTieu.map((m) => m.id)).size !== v.mucTieu.length) throw new Error("Mục tiêu của ô kế hoạch demo chưa hợp lệ.");
  if (v.boMucTieu && (!uuid(v.boMucTieu.id) || !chu(v.boMucTieu.ten, 200) || !chu(v.boMucTieu.nguon, 1000) || !chu(v.boMucTieu.phienBan, 100))) throw new Error("Nguồn bộ MT demo chưa hợp lệ.");
  if (v.mucTieu.length && !v.boMucTieu) throw new Error("Mục tiêu demo thiếu nguồn bộ MT.");
  return v;
}
export function kiemTraDoDaiNguCanh(context: NguCanhGiaoAnThang) {
  if (JSON.stringify(context).length > 20_000) throw new Error("Ô kế hoạch và mục tiêu quá dài để soạn một giáo án. Cô rút gọn nội dung ô hoặc chia hoạt động trước khi soạn nhé.");
}

// Một nguồn cho thông tin nguồn và MT ở bản xem trước, Word, PDF.
export function dongNguCanhGiaoAn(v?: NguCanhGiaoAnThang): { nhan: string; noiDung: string }[] {
  if (!v) return [];
  return [
    { nhan: "Theo kế hoạch", noiDung: `${v.thang.slice(5, 7)}/${v.thang.slice(0, 4)}${v.ngay ? ` · Ngày ${v.ngay}` : " · Nội dung dùng chung"}` },
    { nhan: "Loại tiết", noiDung: `${LOAI_TIET[v.tietHoc.loai].ten}${v.tietHoc.tiet ? ` · ${v.tietHoc.tiet}` : ""} · ${TINH_TRANG_TIET[v.tietHoc.tinhTrang]}` },
    ...(v.tietHoc.phuongPhap ? [{ nhan: "Phương pháp theo kế hoạch", noiDung: v.tietHoc.phuongPhap }] : []),
    ...v.phan.map((p) => ({ nhan: p.tieuDe || "Nội dung theo kế hoạch", noiDung: p.noiDung })),
    ...(v.boMucTieu ? [{ nhan: "Bộ mục tiêu", noiDung: `${v.boMucTieu.ten} · Phiên bản ${v.boMucTieu.phienBan}\nNguồn: ${v.boMucTieu.nguon}` }] : []),
    { nhan: "Mục tiêu theo kế hoạch", noiDung: v.mucTieu.length ? v.mucTieu.map((mt) => `${nhanMucTieu(mt)}: ${mt.moTa}`).join("\n") : "Chưa chọn MT" },
  ];
}

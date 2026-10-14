import { congNgay, noiDungHieuLuc } from "./ke-hoach-thang";
import { LOAI_TIET, nhanMucTieu, TINH_TRANG_TIET } from "./muc-tieu";
import { DO_TUOI_LABEL, NHOM_HOAT_DONG, type KeHoachThang, type NgayTrongThang, type NhomHoatDong, type NoiDungNhom, type TuanTrongThang } from "./types";

export type DongOThang = { chu: string; dam?: boolean; nhe?: boolean };
export type DichChinhO = { id: string; nhan: string };
export type OTrongBangThang = {
  cot: number;
  soCot: number;
  soHang: number;
  dong: DongOThang[];
  dich: DichChinhO[];
  chinhId?: string;
  giaoAnIds: string[];
  mucTieuIds: string[];
  loai: "nhom" | "thu" | "noi-dung" | "muc-tieu";
  dauVanTay?: string;
};
export type BangKeHoachThang = {
  tieuDe: string;
  thongTin: string[];
  cot: { rong: number; dong: DongOThang[]; soCot: number }[];
  rongCot: number[];
  hang: { id: string; o: OTrongBangThang[] }[];
  boMT: string[];
  ngayLap: string;
  chuKy: { vaiTro: string; ten: string[] }[];
};
export const MAU_IN_MAC_DINH = { khoGiay: "Letter", coChu: 14 } as const;
export const THONG_TIN_IN_TRONG = { tenTruong: "", toKhoi: "", namHoc: "", diaDanh: "", ngayLap: "", banGiamHieu: "", khoiTruong: "" };
export function cauHinhTrangThang(plan: KeHoachThang) {
  const f = plan.trinhBay ?? MAU_IN_MAC_DINH;
  return { ...f, rongMm: f.khoGiay === "Letter" ? 279.4 : 297, caoMm: f.khoGiay === "Letter" ? 215.9 : 210, le: { tren: 20, duoi: 20, trai: 30, phai: 15 } };
}
export const ngayNgan = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
export const ngayDayDu = (s: string) => `${ngayNgan(s)}/${s.slice(0, 4)}`;
const thuIndex = (s: string) => (new Date(`${s}T00:00:00Z`).getUTCDay() + 6) % 7;
const thuTen = (n: number) => n === 6 ? "CN" : `T${n + 2}`;
const nhomNgay = new Set<NhomHoatDong>(["tro-chuyen", "hoc", "ngoai-troi", "chieu"]);
function nhom(items: NoiDungNhom[], key: NhomHoatDong) { return items.find((g) => g.nhom === key)!; }
const gopDich = (a: DichChinhO[], b: DichChinhO[]) => [...new Map([...a, ...b].map((d) => [d.id, d])).values()];
function o(loai: OTrongBangThang["loai"], cot: number, dong: DongOThang[], soCot = 1, soHang = 1): OTrongBangThang { return { loai, cot, dong, soCot, soHang, dich: [], giaoAnIds: [], mucTieuIds: [] }; }

// Ô được dựng từ cùng quy tắc tháng → tuần → ngày đang dùng ở editor.
// Chỉ gộp khi cùng nguồn ID, không gộp hai hoạt động riêng có chữ giống nhau.
export function noiDungOThang(plan: KeHoachThang, key: NhomHoatDong, week?: TuanTrongThang, day?: NgayTrongThang): OTrongBangThang {
  const result = noiDungHieuLuc(plan, key, week, day);
  const chain = [nhom(plan.nhom, key), ...(week ? [nhom(week.nhom, key)] : []), ...(day ? [nhom(day.nhom, key)] : [])];
  let active: NoiDungNhom[] = [];
  for (const g of chain) {
    if (g.trangThai === "chua-nhap") continue;
    if (g.trangThai === "khong-ap-dung" || g.cachApDung === "thay-the") active = [];
    active.push(g);
  }
  const own = chain[chain.length - 1];
  const owner = active[active.length - 1] ?? own;
  const tiet = [...active].reverse().find((g) => g.tietHoc)?.tietHoc;
  const dong: DongOThang[] = [];
  if (result.trangThai === "co-noi-dung") {
    if (tiet) {
      dong.push({ chu: `${LOAI_TIET[tiet.loai].ten}: ${tiet.deTai}`, dam: true }, { chu: tiet.linhVuc, nhe: true });
      if (tiet.tiet) dong.push({ chu: `Tiết / mức độ: ${tiet.tiet}` });
      if (tiet.tinhTrang !== "chua-xac-dinh") dong.push({ chu: TINH_TRANG_TIET[tiet.tinhTrang] });
      if (tiet.phuongPhap) dong.push({ chu: `Phương pháp: ${tiet.phuongPhap}` });
    }
    for (const { noiDung: p } of result.phan) {
      if (p.tieuDe) dong.push({ chu: p.tieuDe, dam: true });
      dong.push({ chu: p.noiDung || "Chưa nhập nội dung phần này" });
    }
    const mt = plan.boMucTieu?.mucTieu.filter((m) => result.mucTieuIds.includes(m.id)) ?? [];
    dong.push({ chu: mt.length ? `MT: ${mt.map((m) => m.ma).join(", ")}` : "Chưa gắn MT", nhe: true });
  } else dong.push({ chu: result.trangThai === "khong-ap-dung" ? "Không áp dụng" : "Chưa nhập", nhe: true });
  const targets: DichChinhO[] = [{ id: own.id, nhan: day ? `Riêng ${ngayDayDu(day.ngay)}` : week ? `Chung tuần ${plan.tuan.indexOf(week) + 1}` : "Chung cả tháng" }];
  for (const g of active) if (g.id !== own.id) targets.push({ id: g.id, nhan: g.id === nhom(plan.nhom, key).id ? "Sửa nội dung chung tháng" : `Sửa nội dung chung tuần ${week ? plan.tuan.indexOf(week) + 1 : ""}` });
  if (week && !day) for (const d of week.ngay) targets.push({ id: nhom(d.nhom, key).id, nhan: `Riêng ${ngayDayDu(d.ngay)}` });
  return { ...o("noi-dung", 0, dong), dich: targets, mucTieuIds: result.mucTieuIds, chinhId: day ? own.id : owner.id, giaoAnIds: [...new Set(active.flatMap((g) => [...(g.giaoAnId ? [g.giaoAnId] : []), ...g.phan.flatMap((p) => p.giaoAnId ? [p.giaoAnId] : [])]))], dauVanTay: JSON.stringify([result.trangThai, active.map((g) => g.id), result.phan.map((p) => p.noiDung.id), result.mucTieuIds, result.trangThai === "chua-nhap" ? own.id : ""]) };
}

export function dungBangKeHoachThang(plan: KeHoachThang, tuanId?: string): BangKeHoachThang {
  const weeks = tuanId ? plan.tuan.filter((w) => w.id === tuanId) : plan.tuan;
  const n = weeks.length;
  if (!n) throw new Error("Không tìm thấy tuần để hiển thị.");
  const rongCot = [12, 5, ...weeks.map(() => 66 / n), 17];
  const weekdays = [...new Set(weeks.flatMap((w) => w.ngay.map((d) => thuIndex(d.ngay))))].sort((a, b) => a - b);
  const hang: BangKeHoachThang["hang"] = [];
  for (const group of NHOM_HOAT_DONG) {
    const anyDaily = weeks.some((w) => w.ngay.some((d) => nhom(d.nhom, group.id).trangThai !== "chua-nhap"));
    const anyCommon = nhom(plan.nhom, group.id).trangThai !== "chua-nhap" || weeks.some((w) => nhom(w.nhom, group.id).trangThai !== "chua-nhap");
    const daily = anyDaily || (nhomNgay.has(group.id) && !anyCommon);
    const dayResults = weeks.flatMap((w) => w.ngay.map((d) => noiDungHieuLuc(plan, group.id, w, d)));
    const goalIds = new Set(dayResults.flatMap((r) => r.mucTieuIds));
    const goals = plan.boMucTieu?.mucTieu.filter((m) => goalIds.has(m.id)) ?? [];
    const goalLines: DongOThang[] = goals.length ? goals.flatMap((m) => [{ chu: nhanMucTieu(m), dam: true }, { chu: m.moTa }]) : [{ chu: dayResults.every((r) => r.trangThai === "khong-ap-dung") ? "Không áp dụng" : dayResults.every((r) => r.trangThai === "chua-nhap") ? "Chưa nhập" : "Chưa gắn MT", nhe: true }];
    if (!daily) {
      const cells: OTrongBangThang[] = [o("nhom", 0, [{ chu: group.ten, dam: true }], 2)];
      for (let c = 0; c < n; c++) {
        const cell = noiDungOThang(plan, group.id, weeks[c]); cell.cot = c + 2;
        while (c + cell.soCot < n) {
          const next = noiDungOThang(plan, group.id, weeks[c + cell.soCot]);
          if (next.dauVanTay !== cell.dauVanTay) break;
          cell.dich = gopDich(cell.dich, next.dich); cell.soCot++;
        }
        if (cell.chinhId === nhom(plan.nhom, group.id).id && nhom(plan.nhom, group.id).trangThai !== "chua-nhap") cell.dong.unshift({ chu: "Chung cả tháng", dam: true });
        else if (cell.soCot > 1) cell.dong.unshift({ chu: "Chung các tuần trong ô", dam: true });
        cells.push(cell); c += cell.soCot - 1;
      }
      cells.push(o("muc-tieu", n + 2, goalLines));
      hang.push({ id: group.id, o: cells });
      continue;
    }
    const matrix: (OTrongBangThang | null)[][] = weekdays.map((thu) => weeks.map((w, c) => {
      const day = w.ngay.find((d) => thuIndex(d.ngay) === thu);
      if (!day) {
        const date = congNgay(w.tuNgay, thu - thuIndex(w.tuNgay));
        const outside = date < plan.tuNgay || date > plan.denNgay || !date.startsWith(`${plan.thang}-`);
        return o("noi-dung", c + 2, [{ chu: outside ? "Ngoài phạm vi" : `${ngayNgan(date)} · Không có lịch học`, nhe: true }]);
      }
      const cell = noiDungOThang(plan, group.id, w, day); cell.cot = c + 2;
      cell.dong.unshift({ chu: ngayNgan(day.ngay), nhe: true });
      return cell;
    }));
    for (let c = 0; c < n; c++) for (let r = 0; r < weekdays.length; r++) {
      const cell = matrix[r][c];
      if (!cell?.dauVanTay) continue;
      while (r + cell.soHang < weekdays.length && matrix[r + cell.soHang][c]?.dauVanTay === cell.dauVanTay) {
        const next = matrix[r + cell.soHang][c]!;
        cell.dich = gopDich(cell.dich, next.dich); matrix[r + cell.soHang][c] = null; cell.soHang++;
      }
      if (cell.soHang > 1) {
        cell.chinhId = cell.dich.find((d) => d.nhan.startsWith("Sửa nội dung chung"))?.id ?? cell.chinhId;
        cell.dong[0] = { chu: `Chung ${weekdays.slice(r, r + cell.soHang).map(thuTen).join(", ")}`, nhe: true };
      }
    }
    weekdays.forEach((thu, r) => hang.push({ id: `${group.id}-${thu}`, o: [
      ...(r === 0 ? [o("nhom", 0, [{ chu: group.ten, dam: true }], 1, weekdays.length)] : []),
      o("thu", 1, [{ chu: thuTen(thu), dam: true }]),
      ...matrix[r].filter((c): c is OTrongBangThang => c !== null),
      ...(r === 0 ? [o("muc-tieu", n + 2, goalLines, 1, weekdays.length)] : []),
    ] }));
  }
  // Hai hàng cuối của bảng gốc: chủ đề/sự kiện và đánh giá kết quả thực hiện.
  hang.push({ id: "chu-de-su-kien", o: [o("nhom", 0, [{ chu: "Chủ đề – Sự kiện", dam: true }], 2), ...weeks.map((w, index) => o("noi-dung", index + 2, [{ chu: w.chuDe || "Chưa nhập chủ đề tuần" }])), o("muc-tieu", n + 2, [{ chu: "" }])] });
  const feedback: DongOThang[] = [
    { chu: "ĐÁNH GIÁ CỦA GIÁO VIÊN", dam: true },
    ...((plan.danhGia?.giaoVien ?? "").trim() ? [{ chu: plan.danhGia!.giaoVien }] : Array.from({ length: 3 }, () => ({ chu: ".".repeat(120) }))),
    { chu: "ĐÁNH GIÁ CỦA BAN GIÁM HIỆU", dam: true },
    ...((plan.danhGia?.banGiamHieu ?? "").trim() ? [{ chu: plan.danhGia!.banGiamHieu }] : Array.from({ length: 3 }, () => ({ chu: ".".repeat(120) }))),
  ];
  hang.push({ id: "danh-gia-ket-qua", o: [o("nhom", 0, [{ chu: "Đánh giá KQ thực hiện", dam: true }], 2), o("noi-dung", 2, feedback, n + 1)] });
  const f = plan.thongTinIn ?? THONG_TIN_IN_TRONG;
  return {
    tieuDe: `KẾ HOẠCH GIÁO DỤC THÁNG ${Number(plan.thang.slice(5, 7))} NĂM ${plan.thang.slice(0, 4)}${tuanId ? ` — TUẦN ${plan.tuan.indexOf(weeks[0]) + 1}` : ""}`,
    thongTin: [...(f.tenTruong ? [`Trường: ${f.tenTruong}`] : []), ...(f.toKhoi ? [`Tổ / khối: ${f.toKhoi}`] : []), ...(f.namHoc ? [`Năm học: ${f.namHoc}`] : []), `Lớp: ${plan.tenLop || "Chưa nhập tên lớp"} · ${DO_TUOI_LABEL[plan.doTuoi]}`, `Chủ đề tháng: ${plan.chuDe}`, `Giáo viên chủ nhiệm: ${plan.giaoVien.filter((s) => s.trim()).join("; ") || "Chưa nhập"}`, `Phạm vi: ${ngayDayDu(tuanId ? weeks[0].tuNgay : plan.tuNgay)} – ${ngayDayDu(tuanId ? weeks[n - 1].denNgay : plan.denNgay)}`],
    cot: [{ rong: 17, dong: [{ chu: "Hoạt động", dam: true }], soCot: 2 }, ...weeks.map((w) => ({ rong: 66 / n, soCot: 1, dong: [{ chu: `Tuần ${plan.tuan.indexOf(w) + 1}`, dam: true }, { chu: `${ngayNgan(w.tuNgay)} – ${ngayNgan(w.denNgay)}` }, { chu: w.chuDe || "Chưa nhập chủ đề tuần" }, ...(w.ngay.some((d, i) => i > 0 && d.ngay !== congNgay(w.ngay[i - 1].ngay, 1)) ? [{ chu: `Ngày học: ${w.ngay.map((d) => ngayNgan(d.ngay)).join(", ")}` }] : [])] })), { rong: 17, soCot: 1, dong: [{ chu: "Mục tiêu dự kiến", dam: true }] }],
    rongCot, hang,
    boMT: plan.boMucTieu ? [`Bộ mục tiêu: ${plan.boMucTieu.ten} · Phiên bản ${plan.boMucTieu.phienBan}`, `Nguồn: ${plan.boMucTieu.nguon}`] : ["Chưa chọn bộ mục tiêu."],
    ngayLap: f.ngayLap ? `${f.diaDanh ? `${f.diaDanh}, ` : ""}ngày ${f.ngayLap.slice(8, 10)} tháng ${f.ngayLap.slice(5, 7)} năm ${f.ngayLap.slice(0, 4)}` : `${f.diaDanh ? `${f.diaDanh}, ` : ""}ngày …… tháng …… năm …………`,
    chuKy: [{ vaiTro: "BAN GIÁM HIỆU", ten: f.banGiamHieu ? [f.banGiamHieu] : [] }, { vaiTro: "KHỐI TRƯỞNG", ten: f.khoiTruong ? [f.khoiTruong] : [] }, { vaiTro: "GIÁO VIÊN", ten: plan.giaoVien.filter((s) => s.trim()) }],
  };
}

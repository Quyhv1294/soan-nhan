import { DO_TUOI_LABEL, LINH_VUC, NHOM_HOAT_DONG, type DoTuoi, type KeHoachThang, type NgayTrongThang, type NguCanhGiaoAnThang, type NhomHoatDong, type NoiDungNhom, type PhanNoiDung, type TuanTrongThang } from "./types";
import { docTietHoc } from "./muc-tieu";

// Ngày giáo dục là ngày lịch, không phải timestamp. Mọi phép tính dùng UTC để
// không lệch ngày khi người dùng đổi múi giờ hoặc chuyển giờ mùa hè.
const MOT_NGAY = 86_400_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function laNgay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && Number(value.slice(0, 4)) >= 1900 && Number(value.slice(0, 4)) <= 9999;
}
export function khoangThang(thang: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(thang) || !laNgay(`${thang}-01`)) throw new Error("Cô chọn tháng và năm hợp lệ nhé.");
  const date = new Date(`${thang}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  return { tuNgay: `${thang}-01`, denNgay: date.toISOString().slice(0, 10) };
}
export function congNgay(ngay: string, soNgay: number) {
  if (!laNgay(ngay)) throw new Error("Ngày chưa hợp lệ.");
  return new Date(Date.parse(`${ngay}T00:00:00Z`) + soNgay * MOT_NGAY).toISOString().slice(0, 10);
}
export function thuCuaNgay(ngay: string) {
  if (!laNgay(ngay)) throw new Error("Ngày chưa hợp lệ.");
  const thu = new Date(`${ngay}T00:00:00Z`).getUTCDay();
  return thu === 0 ? "Chủ nhật" : `Thứ ${thu + 1}`;
}
export const nhanNgay = (ngay: string) => `${thuCuaNgay(ngay)}, ${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
function dauTuan(ngay: string) {
  const thu = new Date(`${ngay}T00:00:00Z`).getUTCDay();
  return congNgay(ngay, -((thu + 6) % 7));
}
export function cacNgayTrongKhoang(tuNgay: string, denNgay: string) {
  if (!laNgay(tuNgay) || !laNgay(denNgay) || tuNgay > denNgay || tuNgay.slice(0, 7) !== denNgay.slice(0, 7)) throw new Error("Khoảng ngày phải nằm trong cùng một tháng và ngày kết thúc không trước ngày bắt đầu.");
  const result: string[] = [];
  for (let date = tuNgay; date <= denNgay; date = congNgay(date, 1)) {
    result.push(date);
    if (date === denNgay) break;
  }
  return result;
}
export function taoBayNhom(): NoiDungNhom[] {
  return NHOM_HOAT_DONG.map(({ id }) => ({ id: crypto.randomUUID(), nhom: id, trangThai: "chua-nhap", cachApDung: "bo-sung", phan: [] }));
}
export function taoKeHoachThang(input: { thang: string; chuDe: string; doTuoi: DoTuoi; tuNgay: string; denNgay: string; ngayHoc: string[]; tenLop?: string; giaoVien?: string[] }): KeHoachThang {
  khoangThang(input.thang);
  const allowed = cacNgayTrongKhoang(input.tuNgay, input.denNgay);
  if (!input.ngayHoc.length || input.ngayHoc.some((d) => !allowed.includes(d)) || input.tuNgay.slice(0, 7) !== input.thang) throw new Error("Cô chọn ít nhất một ngày học trong phạm vi tháng nhé.");
  const days = [...new Set(input.ngayHoc)].sort();
  const tuan: TuanTrongThang[] = [];
  for (const ngay of days) {
    let week = tuan[tuan.length - 1];
    if (!week || dauTuan(week.tuNgay) !== dauTuan(ngay)) {
      week = { id: crypto.randomUUID(), chuDe: "", tuNgay: ngay, denNgay: ngay, nhom: taoBayNhom(), ngay: [] };
      tuan.push(week);
    }
    week.denNgay = ngay;
    week.ngay.push({ id: crypto.randomUUID(), ngay, nhom: taoBayNhom() });
  }
  const plan: KeHoachThang = { phienBan: 1, id: crypto.randomUUID(), thang: input.thang, chuDe: input.chuDe.trim(), doTuoi: input.doTuoi, tenLop: input.tenLop?.trim() ?? "", giaoVien: input.giaoVien?.map((v) => v.trim()).filter(Boolean) ?? [], tuNgay: input.tuNgay, denNgay: input.denNgay, nhom: taoBayNhom(), tuan };
  return docKeHoachThang(plan);
}

// Chỉ dựng lại lịch khi cô chủ động áp dụng. Giữ ID, chủ đề, nội dung của
// các tuần/ngày còn trong lịch; người gọi phải xác nhận trước khi bỏ ngày cũ.
export function doiLichHoc(plan: KeHoachThang, input: { tuNgay: string; denNgay: string; ngayHoc: string[] }): KeHoachThang {
  const skeleton = taoKeHoachThang({ ...plan, ...input });
  const oldWeeks = new Map(plan.tuan.map((w) => [dauTuan(w.tuNgay), w]));
  const oldDays = new Map(plan.tuan.flatMap((w) => w.ngay).map((d) => [d.ngay, d]));
  return { ...plan, tuNgay: input.tuNgay, denNgay: input.denNgay, tuan: skeleton.tuan.map((week) => {
    const old = oldWeeks.get(dauTuan(week.tuNgay));
    return { ...week, ...(old ? { id: old.id, chuDe: old.chuDe, nhom: old.nhom } : {}), ngay: week.ngay.map((day) => oldDays.get(day.ngay) ?? day) };
  }) };
}

export type PhamViNoiDung = "thang" | "tuan" | "ngay";
// Không sao chép khối chung vào từng ngày. Bổ sung giữ cả nội dung chung;
// thay thế/không áp dụng là ngoại lệ rõ ràng do giáo viên chọn.
export function noiDungHieuLuc(plan: KeHoachThang, nhom: NhomHoatDong, week?: TuanTrongThang, day?: NgayTrongThang) {
  let phan: { noiDung: PhanNoiDung; phamVi: PhamViNoiDung }[] = [];
  let trangThai: NoiDungNhom["trangThai"] = "chua-nhap";
  let phamVi: PhamViNoiDung | undefined;
  let mucTieuIds: string[] = [];
  const levels = [["thang", plan.nhom], ["tuan", week?.nhom], ["ngay", day?.nhom]] as const;
  for (const [scope, groups] of levels) {
    const group = groups?.find((g) => g.nhom === nhom);
    if (!group || group.trangThai === "chua-nhap") continue;
    phamVi = scope;
    if (group.trangThai === "khong-ap-dung") { phan = []; mucTieuIds = []; trangThai = "khong-ap-dung"; continue; }
    if (group.cachApDung === "thay-the") { phan = []; mucTieuIds = []; }
    phan = [...phan, ...group.phan.map((noiDung) => ({ noiDung, phamVi: scope }))];
    mucTieuIds = [...new Set([...mucTieuIds, ...(group.mucTieuIds ?? [])])];
    trangThai = "co-noi-dung";
  }
  return { trangThai, phan, phamVi, mucTieuIds };
}

// Dùng cùng bộ kiểm tra khi mở, trước khi lưu local và ở API, kể cả chế độ demo.
// Không tự sửa ngày, đổ nội dung mẫu vào ô trống hoặc bỏ phần dữ liệu lỗi.
export function docKeHoachThang(value: unknown): KeHoachThang {
  function fail(message: string): never { throw new Error(`Kế hoạch tháng: ${message}`); }
  function obj(v: unknown): Record<string, unknown> {
    if (!v || typeof v !== "object" || Array.isArray(v)) fail("cấu trúc dữ liệu chưa hợp lệ.");
    return v as Record<string, unknown>;
  }
  function text(v: unknown, label: string, max: number, required = false) {
    if (typeof v !== "string" || v.length > max || (required && !v.trim())) fail(`${label} ${required ? "cần được nhập và " : ""}không quá ${max} ký tự.`);
  }
  function list(v: unknown, label: string, min: number, max: number): unknown[] {
    if (!Array.isArray(v) || v.length < min || v.length > max) fail(`${label} cần có từ ${min} đến ${max} phần tử.`);
    return v;
  }
  const ids = new Set<string>();
  const goalIds = new Set<string>();
  function id(v: unknown) {
    if (typeof v !== "string" || !UUID.test(v) || ids.has(v.toLowerCase())) fail("ID phải hợp lệ và không trùng nhau trong tài liệu.");
    ids.add(v.toLowerCase());
  }
  function date(v: unknown): asserts v is string { if (!laNgay(v)) fail("ngày phải đúng định dạng YYYY-MM-DD và có thực."); }
  function groups(v: unknown, label: string) {
    const found = new Set<string>();
    for (const item of list(v, `${label}: nhóm hoạt động`, 7, 7)) {
      const g = obj(item); id(g.id);
      if (typeof g.nhom !== "string" || !NHOM_HOAT_DONG.some((n) => n.id === g.nhom) || found.has(g.nhom)) fail(`${label}: cần đủ bảy nhóm hoạt động khác nhau.`);
      found.add(g.nhom);
      const where = `${label} — ${NHOM_HOAT_DONG.find((n) => n.id === g.nhom)!.ten}`;
      if (typeof g.trangThai !== "string" || !["chua-nhap", "co-noi-dung", "khong-ap-dung"].includes(g.trangThai) || typeof g.cachApDung !== "string" || !["bo-sung", "thay-the"].includes(g.cachApDung)) fail(`${label}: trạng thái hoặc cách áp dụng chưa hợp lệ.`);
      if (g.mucTieuIds !== undefined) {
        const selected = list(g.mucTieuIds, `${where}: mục tiêu`, 0, 200);
        if (new Set(selected).size !== selected.length || selected.some((v) => typeof v !== "string" || !goalIds.has(v))) fail(`${where}: có mục tiêu bị trùng hoặc không thuộc bộ MT của kế hoạch.`);
        if (g.trangThai !== "co-noi-dung" && selected.length) fail(`${where}: chỉ gắn mục tiêu khi có nội dung.`);
      }
      if (g.tietHoc !== undefined) {
        if (g.nhom !== "hoc" || g.trangThai !== "co-noi-dung") fail(`${where}: thông tin tiết học phải gắn với ô hoạt động học có nội dung.`);
        try { docTietHoc(g.tietHoc); } catch (e) { fail(`${where}: ${e instanceof Error ? e.message : "tiết học chưa hợp lệ."}`); }
      }
      if (g.giaoAnId !== undefined && (g.trangThai !== "co-noi-dung" || typeof g.giaoAnId !== "string" || !UUID.test(g.giaoAnId))) fail(`${where}: liên kết giáo án chưa hợp lệ.`);
      const parts = list(g.phan, `${where}: phần nội dung`, g.trangThai === "co-noi-dung" ? 1 : 0, g.trangThai === "co-noi-dung" ? 50 : 0);
      for (const [index, part] of parts.entries()) {
        const p = obj(part); id(p.id);
        text(p.tieuDe, `${where}: tên phần ${index + 1}`, 200);
        text(p.noiDung, `${where}: nội dung phần ${index + 1}`, 20_000, true);
        if (p.giaoAnId !== undefined && (typeof p.giaoAnId !== "string" || !UUID.test(p.giaoAnId))) fail(`${where}: liên kết giáo án chưa hợp lệ.`);
      }
    }
  }
  const p = obj(value);
  if (p.phienBan !== 1) fail("phiên bản dữ liệu chưa được hỗ trợ. Cô giữ lại tài liệu gốc nhé.");
  id(p.id);
  if (typeof p.thang !== "string") fail("thiếu tháng/năm.");
  khoangThang(p.thang);
  date(p.tuNgay); date(p.denNgay);
  if (p.tuNgay > p.denNgay || !p.tuNgay.startsWith(`${p.thang}-`) || !p.denNgay.startsWith(`${p.thang}-`)) fail("phạm vi ngày phải theo đúng tháng/năm đã chọn.");
  text(p.chuDe, "chủ đề", 200, true); text(p.tenLop, "tên lớp", 200);
  if (typeof p.doTuoi !== "string" || !Object.hasOwn(DO_TUOI_LABEL, p.doTuoi)) fail("độ tuổi chưa hợp lệ.");
  if (p.trinhBay !== undefined) {
    const f = obj(p.trinhBay);
    if (!["Letter", "A4"].includes(String(f.khoGiay)) || typeof f.khoGiay !== "string" || ![12, 13, 14].includes(f.coChu as number)) fail("khổ giấy hoặc cỡ chữ chưa hợp lệ.");
  }
  if (p.thongTinIn !== undefined) {
    const f = obj(p.thongTinIn);
    for (const key of ["tenTruong", "toKhoi", "namHoc", "diaDanh", "banGiamHieu", "khoiTruong"] as const) text(f[key], `thông tin in: ${key}`, 200);
    if (f.ngayLap !== "" && !laNgay(f.ngayLap)) fail("ngày lập văn bản chưa hợp lệ.");
  }
  if (p.danhGia !== undefined) {
    const f = obj(p.danhGia);
    text(f.giaoVien, "đánh giá của giáo viên", 20_000); text(f.banGiamHieu, "đánh giá của ban giám hiệu", 20_000);
  }
  if (p.boMucTieu !== undefined) {
    const b = obj(p.boMucTieu); id(b.id);
    text(b.ten, "tên bộ MT", 200, true); text(b.nguon, "nguồn bộ MT", 1000, true); text(b.phienBan, "phiên bản bộ MT", 100, true);
    if (b.doTuoi !== p.doTuoi) fail("độ tuổi bộ MT phải khớp độ tuổi kế hoạch.");
    const codes = new Set<string>();
    for (const item of list(b.mucTieu, "bộ MT", 0, 200)) {
      const mt = obj(item); id(mt.id);
      text(mt.ma, "mã MT", 40, true); text(mt.chiTieu, "chỉ tiêu MT", 100); text(mt.moTa, "mô tả MT", 6000, true);
      const code = (mt.ma as string).trim().toLocaleUpperCase("vi");
      if (codes.has(code)) fail("mã MT trong bộ bị trùng.");
      codes.add(code); goalIds.add(mt.id as string);
      if (mt.linhVuc !== undefined && !LINH_VUC.includes(mt.linhVuc as never)) fail("lĩnh vực của MT chưa hợp lệ.");
    }
  }
  for (const name of list(p.giaoVien, "giáo viên", 0, 10)) text(name, "tên giáo viên", 200, true);
  if (p._tieuDe !== undefined) text(p._tieuDe, "tên tài liệu", 200, true);
  groups(p.nhom, "Nội dung chung tháng");
  let previous = "";
  const calendarWeeks = new Set<string>();
  for (const item of list(p.tuan, "tuần", 1, 6)) {
    const week = obj(item); id(week.id); text(week.chuDe, "chủ đề tuần", 200);
    date(week.tuNgay); date(week.denNgay);
    const monday = dauTuan(week.tuNgay);
    if (week.tuNgay < p.tuNgay || week.denNgay > p.denNgay || week.tuNgay > week.denNgay || dauTuan(week.denNgay) !== monday || calendarWeeks.has(monday)) fail("khoảng tuần bị trùng hoặc vượt phạm vi kế hoạch.");
    calendarWeeks.add(monday);
    const label = `Tuần ${week.tuNgay}`;
    groups(week.nhom, label);
    const days = list(week.ngay, `${label}: ngày học`, 1, 7);
    for (const item of days) {
      const day = obj(item); id(day.id); date(day.ngay);
      if (day.ngay <= previous || day.ngay < week.tuNgay || day.ngay > week.denNgay) fail("các ngày học phải tăng dần, không trùng và nằm trong đúng tuần.");
      previous = day.ngay;
      groups(day.nhom, nhanNgay(day.ngay));
    }
    if (obj(days[0]).ngay !== week.tuNgay || obj(days[days.length - 1]).ngay !== week.denNgay) fail("khoảng tuần phải khớp ngày học đầu và cuối.");
  }
  return value as KeHoachThang;
}

export function tieuDeKeHoachThang(plan: Pick<KeHoachThang, "thang" | "chuDe">) {
  return `Kế hoạch tháng ${plan.thang.slice(5, 7)}/${plan.thang.slice(0, 4)}: ${plan.chuDe}`.slice(0, 200);
}

export function saoChepKeHoachThang(plan: KeHoachThang): KeHoachThang {
  const goalIds = new Map(plan.boMucTieu?.mucTieu.map((mt) => [mt.id, crypto.randomUUID()]) ?? []);
  function groups(items: NoiDungNhom[]): NoiDungNhom[] {
    return items.map(({ giaoAnId: _old, ...g }) => ({ ...g, id: crypto.randomUUID(), ...(g.mucTieuIds ? { mucTieuIds: g.mucTieuIds.map((id) => goalIds.get(id)!) } : {}), phan: g.phan.map(({ giaoAnId: _part, ...part }) => ({ ...part, id: crypto.randomUUID() })) }));
  }
  return { ...plan, id: crypto.randomUUID(), ...(plan.boMucTieu ? { boMucTieu: { ...plan.boMucTieu, id: crypto.randomUUID(), mucTieu: plan.boMucTieu.mucTieu.map((mt) => ({ ...mt, id: goalIds.get(mt.id)! })) } } : {}), nhom: groups(plan.nhom), tuan: plan.tuan.map((week) => ({ ...week, id: crypto.randomUUID(), nhom: groups(week.nhom), ngay: week.ngay.map((day) => ({ ...day, id: crypto.randomUUID(), nhom: groups(day.nhom) })) })) };
}

export function boLienKetGiaoAnThang(plan: KeHoachThang, id: string): KeHoachThang {
  let changed = false;
  function groups(items: NoiDungNhom[]): NoiDungNhom[] {
    return items.map((g) => {
      const { giaoAnId, ...rest } = g;
      if (giaoAnId === id) changed = true;
      return { ...(giaoAnId === id ? rest : g), phan: g.phan.map((part) => { if (part.giaoAnId !== id) return part; changed = true; const { giaoAnId: _old, ...rest } = part; return rest; }) };
    });
  }
  const next = { ...plan, nhom: groups(plan.nhom), tuan: plan.tuan.map((week) => ({ ...week, nhom: groups(week.nhom), ngay: week.ngay.map((day) => ({ ...day, nhom: groups(day.nhom) })) })) };
  return changed ? next : plan;
}

export type ONoiDung = { nhom: NoiDungNhom; tuan?: TuanTrongThang; ngay?: NgayTrongThang; nhan: string };
export function cacONoiDung(plan: KeHoachThang): ONoiDung[] {
  return [
    ...plan.nhom.map((nhom) => ({ nhom, nhan: "Chung cả tháng" })),
    ...plan.tuan.flatMap((tuan, index) => [
      ...tuan.nhom.map((nhom) => ({ nhom, tuan, nhan: `Chung tuần ${index + 1}` })),
      ...tuan.ngay.flatMap((ngay) => ngay.nhom.map((nhom) => ({ nhom, tuan, ngay, nhan: nhanNgay(ngay.ngay) }))),
    ]),
  ];
}
export function layNguCanhGiaoAn(plan: KeHoachThang, nhomId: string): NguCanhGiaoAnThang {
  const cell = cacONoiDung(plan).find((o) => o.nhom.id === nhomId);
  if (!cell || cell.nhom.nhom !== "hoc" || cell.nhom.trangThai !== "co-noi-dung" || !cell.nhom.tietHoc) throw new Error("Ô hoạt động học không còn hoặc chưa có loại tiết, đề tài. Cô mở lại kế hoạch để kiểm tra nhé.");
  const resolved = noiDungHieuLuc(plan, "hoc", cell.tuan, cell.ngay);
  const b = plan.boMucTieu;
  return { keHoachId: plan.id, nhomId, thang: plan.thang, ...(cell.ngay ? { ngay: cell.ngay.ngay } : {}), chuDe: cell.tuan?.chuDe.trim() || plan.chuDe, doTuoi: plan.doTuoi, tietHoc: cell.nhom.tietHoc, phan: resolved.phan.map(({ noiDung: p }) => ({ tieuDe: p.tieuDe, noiDung: p.noiDung })), ...(b ? { boMucTieu: { id: b.id, ten: b.ten, phienBan: b.phienBan, nguon: b.nguon } } : {}), mucTieu: b?.mucTieu.filter((mt) => resolved.mucTieuIds.includes(mt.id)) ?? [] };
}

// Gắn đúng ô theo ID, không ghi đè toàn bộ kế hoạch bằng bản cũ của trang giáo án.
export function ganGiaoAnThang(plan: KeHoachThang, nhomId: string, giaoAnId: string | null, expectedId: string | null): KeHoachThang {
  const cell = cacONoiDung(plan).find((o) => o.nhom.id === nhomId);
  if (!cell || cell.nhom.trangThai !== "co-noi-dung") throw new Error("Ô hoạt động không còn hoặc đã thay đổi. Cô mở lại kế hoạch nhé.");
  if (giaoAnId && !UUID.test(giaoAnId)) throw new Error("ID giáo án chưa hợp lệ.");
  const current = cell.nhom.giaoAnId ?? null;
  if (current === giaoAnId) return plan;
  if (current !== expectedId) throw new Error("Ô này vừa đổi liên kết giáo án. Cô mở lại kế hoạch trước khi gắn lại nhé.");
  const update = (groups: NoiDungNhom[]) => groups.map((g) => { if (g.id !== nhomId) return g; const { giaoAnId: _old, ...rest } = g; return giaoAnId ? { ...rest, giaoAnId } : rest; });
  return { ...plan, nhom: update(plan.nhom), tuan: plan.tuan.map((w) => ({ ...w, nhom: update(w.nhom), ngay: w.ngay.map((d) => ({ ...d, nhom: update(d.nhom) })) })) };
}

export function kiemTraGanTuDong(plan: KeHoachThang, nhomId: string, lesson: { id: string; nguCanhKeHoach?: unknown }) {
  if (cacONoiDung(plan).find((o) => o.nhom.id === nhomId)?.nhom.giaoAnId === lesson.id) return;
  // JSONB đổi thứ tự khóa. Chỉ thứ tự các phần/mục tiêu (array) có ý nghĩa;
  // thứ tự thuộc tính object không được gây ra xung đột giả khi dùng Supabase.
  const signature = (value: unknown) => JSON.stringify(value, (_key, v) => v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v);
  if (!lesson.nguCanhKeHoach || signature(layNguCanhGiaoAn(plan, nhomId)) !== signature(lesson.nguCanhKeHoach)) throw new Error("Nội dung hoặc MT của ô đã đổi trong lúc soạn. Cô mở lại kế hoạch để kiểm tra rồi gắn giáo án đã lưu nhé.");
}

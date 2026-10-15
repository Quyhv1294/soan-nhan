"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useXacNhan } from "@/components/XacNhan";
import { ArrowDown, ArrowUp, CalendarDays, Plus, Save, Trash2 } from "lucide-react";
import { Button, ButtonLink, Field, Input, PageHeader, Textarea } from "@/components/ui";
import { Modal } from "@/components/Modal";
import { docTaiLieu, luuTaiLieu } from "@/lib/kho-local";
import { demoAllowed } from "@/lib/supabase/configured";
import { useHoSo } from "@/lib/use-ho-so";
import { cacNgayTrongKhoang, cacONoiDung, docKeHoachThang, doiLichHoc, khoangThang, nhanNgay, noiDungHieuLuc, taoKeHoachThang, thuCuaNgay, type ONoiDung } from "@/lib/ke-hoach-thang";
import { DO_TUOI_LABEL, LINH_VUC, NHOM_HOAT_DONG, type BoMucTieu, type DoTuoi, type KeHoachThang, type LoaiTiet, type NgayTrongThang, type NoiDungNhom, type PhanNoiDung, type TietHoc, type TuanTrongThang } from "@/lib/types";
import { LOAI_TIET, nhanMucTieu, TINH_TRANG_TIET } from "@/lib/muc-tieu";
import { hrefSoanTuThang, lienKetGiaoAnThang } from "@/lib/lien-ket-thang";
import { hrefXemGiaoAn } from "@/lib/lien-ket";
import { BoMucTieuEditor, ChonMucTieu } from "./MucTieuEditor";
import { ChonGiaoAn } from "./ChonGiaoAn";
import { BangThang } from "./BangThang";
import { BanInThang } from "./BanInThang";
import { ThongTinInEditor } from "./ThongTinInEditor";
import { ActionMenu } from "@/components/ActionMenu";
import { NutTaiFile } from "@/components/NutTaiFile";

type LichHoc = { tuNgay: string; denNgay: string; ngayHoc: string[] };
type ViTri = { cap: "thang" } | { cap: "tuan"; tuanId: string } | { cap: "ngay"; tuanId: string; ngayId: string };
const SELECT = "min-h-11 w-full rounded-o border border-vien-nhap bg-trang px-3 text-base text-muc focus:outline-bang";
function ngayTrongTuan(days: string[]) { return days.filter((d) => !["Thứ 7", "Chủ nhật"].includes(thuCuaNgay(d))); }
function loi(e: unknown) { return e instanceof Error ? e.message : "Chưa thực hiện được. Cô thử lại nhé."; }
function nhanKhoang(tu: string, den: string) { return `${tu.slice(8, 10)}/${tu.slice(5, 7)} – ${den.slice(8, 10)}/${den.slice(5, 7)}`; }

function ChonLich({ thang, value, onChange }: { thang: string; value: LichHoc; onChange: (v: LichHoc) => void }) {
  let bounds: ReturnType<typeof khoangThang> | undefined;
  let days: string[] = [];
  try { bounds = khoangThang(thang); days = cacNgayTrongKhoang(value.tuNgay, value.denNgay); } catch { /* Hiển thị lỗi nhập ở dưới. */ }
  function range(key: "tuNgay" | "denNgay", date: string) {
    const next = { ...value, [key]: date };
    // Giữ lựa chọn cũ trong phạm vi mới. Mở rộng lịch không tự thêm ngày học.
    onChange({ ...next, ngayHoc: value.ngayHoc.filter((d) => d >= next.tuNgay && d <= next.denNgay) });
  }
  return <div className="space-y-4">
    <details open={!days.length} className="rounded-o border border-vien bg-trang">
      <summary className="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-2 px-3 py-2 text-sm"><span className="font-semibold">Khoảng ngày: {value.tuNgay && value.denNgay ? `${value.tuNgay.slice(8, 10)}/${value.tuNgay.slice(5, 7)} – ${value.denNgay.slice(8, 10)}/${value.denNgay.slice(5, 7)}` : "chưa hợp lệ"}</span><span className="text-muc-nhat">· cả tháng. Bấm để sửa nếu lớp chỉ học một phần tháng.</span></summary>
    <div className="grid gap-4 border-t border-vien p-3 sm:grid-cols-2">
      <Field label="Từ ngày"><Input type="date" required min={bounds?.tuNgay} max={bounds?.denNgay} value={value.tuNgay} onChange={(e) => range("tuNgay", e.target.value)} /></Field>
      <Field label="Đến ngày"><Input type="date" required min={bounds?.tuNgay} max={bounds?.denNgay} value={value.denNgay} onChange={(e) => range("denNgay", e.target.value)} /></Field>
    </div>
    </details>
    {!days.length ? <p role="alert" className="text-sm text-butdo">Cô nhập khoảng ngày hợp lệ trong tháng đã chọn nhé.</p> : <fieldset>
      <legend className="font-semibold">Ngày học <span className="font-normal text-muc-nhat">· {value.ngayHoc.length} ngày đã chọn</span></legend>
      <p className="mt-1 text-sm text-muc-nhat">Bỏ chọn ngày nghỉ; có thể chọn Thứ Bảy, Chủ nhật nếu lớp có học.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="nhe" onClick={() => onChange({ ...value, ngayHoc: ngayTrongTuan(days) })}>Chọn T2–T6</Button>
        <Button type="button" variant="nhe" onClick={() => onChange({ ...value, ngayHoc: [] })}>Bỏ chọn tất cả</Button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">{days.map((day) => <label key={day} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-o border border-vien bg-trang p-2 text-sm has-[:checked]:border-bang has-[:checked]:bg-bang-nhat"><input type="checkbox" className="h-4 w-4 accent-bang" checked={value.ngayHoc.includes(day)} onChange={(e) => onChange({ ...value, ngayHoc: e.target.checked ? [...value.ngayHoc, day].sort() : value.ngayHoc.filter((d) => d !== day) })} />{nhanNgay(day)}</label>)}</div>
    </fieldset>}
  </div>;
}

function TaoThang({ onCreate }: { onCreate: (p: KeHoachThang) => void }) {
  const { profile, daNap } = useHoSo();
  const [thang, setThang] = useState("");
  const [lich, setLich] = useState<LichHoc>({ tuNgay: "", denNgay: "", ngayHoc: [] });
  const [error, setError] = useState("");
  useEffect(() => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const bounds = khoangThang(current);
    setThang(current); setLich({ ...bounds, ngayHoc: ngayTrongTuan(cacNgayTrongKhoang(bounds.tuNgay, bounds.denNgay)) });
  }, []);
  function doiThang(v: string) {
    setThang(v);
    try { const bounds = khoangThang(v); setLich({ ...bounds, ngayHoc: ngayTrongTuan(cacNgayTrongKhoang(bounds.tuNgay, bounds.denNgay)) }); } catch { setLich({ tuNgay: "", denNgay: "", ngayHoc: [] }); }
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const data = new FormData(e.currentTarget);
    try { onCreate(taoKeHoachThang({ thang, ...lich, chuDe: String(data.get("chuDe") ?? ""), doTuoi: data.get("doTuoi") as DoTuoi, tenLop: String(data.get("tenLop") ?? ""), giaoVien: String(data.get("giaoVien") ?? "").split("\n").filter((v) => v.trim()) })); }
    catch (e) { setError(loi(e)); }
  }
  return <form onSubmit={submit} className="max-w-4xl space-y-5 rounded-the border border-vien bg-trang p-4 sm:p-6">
    <h2 className="text-xl font-bold">Tạo kế hoạch tháng</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Tháng, năm"><div className="grid grid-cols-2 gap-2">
        <select aria-label="Tháng" className={SELECT} value={thang.slice(5, 7)} onChange={(e) => doiThang(`${thang.slice(0, 4)}-${e.target.value}`)}>{Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => <option key={m} value={m}>Tháng {Number(m)}</option>)}</select>
        <select aria-label="Năm" className={SELECT} value={thang.slice(0, 4)} onChange={(e) => doiThang(`${e.target.value}-${thang.slice(5, 7)}`)}>{Array.from({ length: 4 }, (_, i) => String(new Date().getFullYear() - 1 + i)).map((y) => <option key={y} value={y}>Năm {y}</option>)}</select>
      </div></Field>
      <Field label="Độ tuổi"><select key={daNap ? profile.doTuoi : "loading"} name="doTuoi" disabled={!daNap} className={SELECT} defaultValue={Object.entries(DO_TUOI_LABEL).find(([id, label]) => id === profile.doTuoi || label === profile.doTuoi)?.[0] ?? "5-6"}>{Object.entries(DO_TUOI_LABEL).map(([id, ten]) => <option key={id} value={id}>{ten}</option>)}</select></Field>
    </div>
    <Field label="Chủ đề tháng"><Input name="chuDe" required maxLength={200} placeholder="Ví dụ: Bản thân" /></Field>
    <Field label="Tên lớp (không bắt buộc)"><Input name="tenLop" key={daNap ? profile.tenLop : "loading"} disabled={!daNap} defaultValue={profile.tenLop} maxLength={200} /></Field>
    <Field label="Giáo viên chủ nhiệm (không bắt buộc)" hint="Mỗi giáo viên một dòng."><Textarea name="giaoVien" rows={2} maxLength={2000} /></Field>
    <ChonLich thang={thang} value={lich} onChange={setLich} />
    {error && <p role="alert" className="text-butdo">{error}</p>}
    <Button type="submit" disabled={!daNap || !thang || !lich.ngayHoc.length}><Plus size={18} aria-hidden="true" />Tạo kế hoạch tháng</Button>
  </form>;
}

const TEN_CAP = { thang: "tháng", tuan: "tuần", ngay: "ngày" };
function NhomEditor({ value, cap, onChange, bo, onSoan, onGan, onBo, mo }: { value: NoiDungNhom; cap: ViTri["cap"]; onChange: (v: NoiDungNhom) => void; bo?: BoMucTieu; onSoan: () => void; onGan: () => void; onBo: () => void; mo: boolean }) {
  const name = NHOM_HOAT_DONG.find((n) => n.id === value.nhom)!.ten;
  const { xacNhan, hopThoai } = useXacNhan();
  async function status(next: NoiDungNhom["trangThai"]) {
    if (value.phan.length && next !== "co-noi-dung" && !(await xacNhan("Nội dung riêng trong nhóm này sẽ được bỏ. Cô tiếp tục nhé?"))) return;
    const { mucTieuIds: _mt, tietHoc: _tiet, giaoAnId: _ga, ...rest } = value;
    onChange({ ...(next === "co-noi-dung" ? value : rest), trangThai: next, phan: next === "co-noi-dung" ? value.phan.length ? value.phan : [{ id: crypto.randomUUID(), tieuDe: "", noiDung: "" }] : [] });
  }
  function part(id: string, change: Partial<PhanNoiDung>) { onChange({ ...value, phan: value.phan.map((p) => p.id === id ? { ...p, ...change } : p) }); }
  function move(index: number, delta: number) { const next = [...value.phan]; [next[index], next[index + delta]] = [next[index + delta], next[index]]; onChange({ ...value, phan: next }); }
  function tiet(change: Partial<TietHoc>) { if (value.tietHoc) onChange({ ...value, tietHoc: { ...value.tietHoc, ...change } }); }
  function themPhan(ten: string) {
    const blank = value.phan.find((p) => !p.tieuDe.trim() && !p.noiDung.trim() && !p.giaoAnId);
    onChange({ ...value, phan: blank ? value.phan.map((p) => p.id === blank.id ? { ...p, tieuDe: ten } : p) : [...value.phan, { id: crypto.randomUUID(), tieuDe: ten, noiDung: "" }] });
  }
  return <details open={mo} id={`o-${value.id}`} className="scroll-mt-40 rounded-o border border-vien bg-trang">
    <summary className="cursor-pointer rounded-o p-4 font-semibold focus-visible:outline-bang">{name}<span className="ml-2 text-sm font-normal text-muc-nhat">{value.trangThai === "co-noi-dung" ? `${value.phan.length} phần · ${value.mucTieuIds?.length || "Chưa gắn"} MT${value.giaoAnId ? " · Có giáo án" : ""}` : value.trangThai === "khong-ap-dung" ? "Không áp dụng" : cap === "thang" ? "Chưa nhập" : "Dùng nội dung chung nếu có"}</span></summary>
    <div className="space-y-4 border-t border-vien p-4">
      {hopThoai}
      <Field label={`Nội dung ${name.toLocaleLowerCase("vi")} của ${TEN_CAP[cap]}`}>
        <select className={SELECT} value={value.trangThai} onChange={(e) => status(e.target.value as NoiDungNhom["trangThai"])}>
          <option value="chua-nhap">{cap === "thang" ? "Chưa nhập" : "Dùng nội dung chung nếu có"}</option><option value="co-noi-dung">Nhập nội dung riêng</option><option value="khong-ap-dung">Không áp dụng</option>
        </select>
      </Field>
      {value.trangThai === "co-noi-dung" && <>
        {cap !== "thang" && <Field label="Cách áp dụng"><select className={SELECT} value={value.cachApDung} onChange={(e) => onChange({ ...value, cachApDung: e.target.value as NoiDungNhom["cachApDung"] })}><option value="bo-sung">Bổ sung vào nội dung chung</option><option value="thay-the">Thay thế nội dung chung</option></select></Field>}
        {value.nhom === "hoc" && <div className="space-y-4 rounded-o border border-vien p-3">
          <Field label="Loại tiết"><select className={SELECT} value={value.tietHoc?.loai ?? ""} onChange={(e) => { const loai = e.target.value as LoaiTiet; onChange({ ...value, tietHoc: loai ? { loai, deTai: value.tietHoc?.deTai ?? "", linhVuc: LOAI_TIET[loai].linhVuc, tiet: value.tietHoc?.tiet ?? "", tinhTrang: value.tietHoc?.tinhTrang ?? "chua-xac-dinh", phuongPhap: value.tietHoc?.phuongPhap ?? "" } : undefined }); }}><option value="">Chưa chọn loại tiết</option>{Object.entries(LOAI_TIET).map(([id, item]) => <option key={id} value={id}>{item.ten}</option>)}</select></Field>
          {value.tietHoc && <>
            <Field label={value.tietHoc.loai === "van-hoc" ? "Đề tài / tên tác phẩm" : "Đề tài"}><Input value={value.tietHoc.deTai} maxLength={200} onChange={(e) => tiet({ deTai: e.target.value })} /></Field>
            <Field label="Lĩnh vực phát triển"><select className={SELECT} value={value.tietHoc.linhVuc} onChange={(e) => tiet({ linhVuc: e.target.value as TietHoc["linhVuc"] })}>{LINH_VUC.map((l) => <option key={l}>{l}</option>)}</select></Field>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Tiết / mức độ (không bắt buộc)"><Input value={value.tietHoc.tiet} maxLength={200} onChange={(e) => tiet({ tiet: e.target.value })} placeholder="Tiết 1, ôn phạm vi 7…" /></Field><Field label="Trạng thái học"><select className={SELECT} value={value.tietHoc.tinhTrang} onChange={(e) => tiet({ tinhTrang: e.target.value as TietHoc["tinhTrang"] })}>{Object.entries(TINH_TRANG_TIET).map(([id, ten]) => <option key={id} value={id}>{ten}</option>)}</select></Field></div>
            <Field label="Phương pháp (không bắt buộc)"><Input value={value.tietHoc.phuongPhap} maxLength={1000} onChange={(e) => tiet({ phuongPhap: e.target.value })} placeholder="STEAM, Montessori…" /></Field>
            <p className="text-sm text-muc-nhat">Các phần gợi ý theo loại tiết được thêm bằng nút bên dưới. Đổi loại tiết giữ nội dung đã nhập để cô rà lại.</p>
            <div className="flex flex-wrap gap-2">{LOAI_TIET[value.tietHoc.loai].phan.map((ten) => <Button key={ten} type="button" variant="phu" disabled={value.phan.length >= 50 || value.phan.some((p) => p.tieuDe === ten)} onClick={() => themPhan(ten)}>Thêm {ten}</Button>)}</div>
          </>}
        </div>}
        <ChonMucTieu bo={bo} value={value.mucTieuIds ?? []} onChange={(ids) => onChange({ ...value, mucTieuIds: ids })} />
        {value.phan.map((p, index) => <fieldset key={p.id} className="space-y-3 rounded-o border border-vien p-3">
          <legend className="px-1 text-sm font-semibold">Phần {index + 1}</legend>
          <Field label="Tên phần (không bắt buộc)"><Input value={p.tieuDe} maxLength={200} placeholder="Ví dụ: Góc trọng tâm, chuẩn bị, VĐCB, TCVĐ…" onChange={(e) => part(p.id, { tieuDe: e.target.value })} /></Field>
          <Field label={p.tieuDe ? `Nội dung ${p.tieuDe}` : "Nội dung"}><Textarea rows={4} value={p.noiDung} maxLength={20_000} onChange={(e) => part(p.id, { noiDung: e.target.value })} /></Field>
          {p.giaoAnId && <ButtonLink href={hrefXemGiaoAn(p.giaoAnId)} variant="nhe">Mở giáo án của phần</ButtonLink>}
          <div className="flex flex-wrap gap-1"><Button type="button" variant="nhe" disabled={index === 0} aria-label={`Đưa phần ${index + 1} lên`} onClick={() => move(index, -1)}><ArrowUp size={16} aria-hidden="true" /></Button><Button type="button" variant="nhe" disabled={index === value.phan.length - 1} aria-label={`Đưa phần ${index + 1} xuống`} onClick={() => move(index, 1)}><ArrowDown size={16} aria-hidden="true" /></Button><Button type="button" variant="nhe" onClick={async () => { if (p.noiDung.trim() && !(await xacNhan("Bỏ phần nội dung này?", { nutDongY: "Bỏ phần" }))) return; const phan = value.phan.filter((x) => x.id !== p.id); const { mucTieuIds: _mt, tietHoc: _tiet, giaoAnId: _ga, ...rest } = value; onChange(phan.length ? { ...value, phan } : { ...rest, phan, trangThai: "chua-nhap" }); }}><Trash2 size={16} aria-hidden="true" />Bỏ phần</Button></div>
        </fieldset>)}
        <Button type="button" variant="phu" disabled={value.phan.length >= 50} onClick={() => onChange({ ...value, phan: [...value.phan, { id: crypto.randomUUID(), tieuDe: "", noiDung: "" }] })}><Plus size={16} aria-hidden="true" />Thêm phần nội dung</Button>
        <div className="space-y-3 border-t border-vien pt-4">
          <p className="font-semibold">Giáo án của ô</p>
          <div className="flex flex-wrap gap-2">{(value.giaoAnId || (value.nhom === "hoc" && value.tietHoc)) && <Button type="button" onClick={onSoan}>{value.giaoAnId ? "Mở giáo án" : "Lưu và soạn giáo án"}</Button>}<Button type="button" variant="phu" onClick={onGan}>{value.giaoAnId ? "Đổi giáo án liên kết" : "Gắn giáo án đã có"}</Button>{value.giaoAnId && <Button type="button" variant="nhe" onClick={onBo}>Bỏ liên kết</Button>}</div>
          <p className="text-sm text-muc-nhat">{value.giaoAnId ? "Sửa ô không tự sửa giáo án đã lưu. Cô mở giáo án để chỉnh hoặc soạn lại khi cần." : "Chọn loại tiết và nhập đề tài ở Hoạt động học để soạn theo ô. Kế hoạch sẽ được lưu trước khi mở trang giáo án."}</p>
        </div>
      </>}
      {value.trangThai === "khong-ap-dung" && <p className="text-sm text-muc-nhat">Nhóm này không áp dụng trong {TEN_CAP[cap]} đã chọn, kể cả khi có nội dung chung.</p>}
    </div>
  </details>;
}

function NoiDungApDung({ plan, week, day, onEdit, onLesson }: { plan: KeHoachThang; week?: TuanTrongThang; day?: NgayTrongThang; onEdit: (cell: ONoiDung) => void; onLesson: (group: NoiDungNhom) => void }) {
  const cells = cacONoiDung(plan);
  return <div className="mt-4 space-y-5">{NHOM_HOAT_DONG.map((n) => {
    const result = noiDungHieuLuc(plan, n.id, week, day);
    const selected = plan.boMucTieu?.mucTieu.filter((mt) => result.mucTieuIds.includes(mt.id)) ?? [];
    return <section key={n.id}><h3 className="font-semibold">{n.ten}</h3>
      {result.trangThai !== "co-noi-dung" ? <p className="mt-1 text-sm text-muc-nhat">{result.trangThai === "chua-nhap" ? "Chưa nhập" : "Không áp dụng"}</p> : <>
        <p className="mt-1 text-sm text-muc-nhat">{selected.length ? selected.map(nhanMucTieu).join(", ") : "Chưa gắn MT"}</p>
        <div className="mt-2 space-y-3">{result.phan.map(({ noiDung: p, phamVi }) => {
          const origin = cells.find((c) => c.nhom.phan.some((part) => part.id === p.id));
          return <div key={p.id} className="border-l-2 border-bang/30 pl-3"><p className="text-sm text-muc-nhat">{p.tieuDe || "Nội dung"} · Theo {TEN_CAP[phamVi]}</p><p className="mt-1 whitespace-pre-wrap break-words">{p.noiDung || "Chưa nhập nội dung phần này"}</p>{origin && <div className="mt-1 flex flex-wrap gap-1"><Button type="button" variant="nhe" onClick={() => onEdit(origin)}>Chỉnh ô {TEN_CAP[phamVi]} gốc</Button>{origin.nhom.giaoAnId && <Button type="button" variant="nhe" onClick={() => onLesson(origin.nhom)}>Mở giáo án</Button>}</div>}</div>;
        })}</div>
      </>}
    </section>;
  })}</div>;
}

export function KeHoachThangView({ documentId, nhomId }: { documentId?: string; nhomId?: string }) {
  const router = useRouter();
  const { xacNhan, hopThoai } = useXacNhan();
  const [plan, setPlan] = useState<KeHoachThang | null>(null);
  const [loading, setLoading] = useState(Boolean(documentId));
  const [loadError, setLoadError] = useState("");
  const [retry, setRetry] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [viTri, setViTri] = useState<ViTri>({ cap: "thang" });
  const [lich, setLich] = useState<LichHoc | null>(null);
  const [activeGroup, setActiveGroup] = useState(nhomId ?? "");
  const [chonGiaoAn, setChonGiaoAn] = useState<NoiDungNhom | null>(null);
  const [view, setView] = useState<"table" | "edit">(nhomId ? "edit" : "table");
  const [printSnapshot, setPrintSnapshot] = useState<KeHoachThang | null>(null);
  function moO(cell: ONoiDung) {
    setView("edit");
    setViTri(cell.ngay ? { cap: "ngay", tuanId: cell.tuan!.id, ngayId: cell.ngay.id } : cell.tuan ? { cap: "tuan", tuanId: cell.tuan.id } : { cap: "thang" });
    setActiveGroup(cell.nhom.id);
    setTimeout(() => document.getElementById(`o-${cell.nhom.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  useEffect(() => {
    if (!documentId) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    setLoading(true); setLoadError("");
    async function load() {
      let data: unknown;
      if (demoAllowed()) data = docTaiLieu().find((d) => d.id === documentId && d.loai === "ke-hoach-thang")?.noiDung;
      else {
        const response = await fetch(`/api/documents?loai=ke-hoach-thang&id=${encodeURIComponent(documentId!)}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Chưa tải được kế hoạch tháng.");
        data = result.demo ? docTaiLieu().find((d) => d.id === documentId && d.loai === "ke-hoach-thang")?.noiDung : result.documents?.find((d: { id: string; loai: string }) => d.id === documentId && d.loai === "ke-hoach-thang")?.noi_dung;
      }
      if (!data) throw new Error("Không tìm thấy kế hoạch tháng trong thư viện này.");
      const saved = docKeHoachThang(data);
      if (active) { setPlan(saved); setDirty(false); const cell = cacONoiDung(saved).find((o) => o.nhom.id === nhomId); if (cell) moO(cell); }
    }
    load().catch((e) => { if (active) setLoadError(e instanceof Error && e.name === "AbortError" ? "Tải kế hoạch quá lâu. Cô thử lại nhé." : loi(e)); }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [documentId, nhomId, retry]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function change(next: KeHoachThang) { setPlan(next); setDirty(true); setMessage(""); setError(""); }
  async function save() {
    if (!plan || busy) return null;
    setBusy(true); setError(""); setMessage("");
    try {
      const snapshot = docKeHoachThang({ ...plan, giaoVien: plan.giaoVien.map((v) => v.trim()).filter(Boolean) });
      const id = await luuTaiLieu("ke-hoach-thang", snapshot as unknown as Record<string, unknown>);
      setPlan({ ...snapshot, id }); setDirty(false);
      window.history.replaceState(null, "", `/ke-hoach-thang?id=${encodeURIComponent(id)}`);
      setMessage(demoAllowed() ? "Đã lưu kế hoạch trên trình duyệt này." : "Đã lưu kế hoạch vào thư viện.");
      return { ...snapshot, id };
    } catch (e) { setError(loi(e)); return null; }
    finally { setBusy(false); }
  }
  async function moGiaoAn(group: NoiDungNhom) {
    if (!plan || busy) return;
    const saved = dirty ? await save() : plan;
    if (!saved) return;
    const href = group.nhom === "hoc" && group.tietHoc ? hrefSoanTuThang(saved.id, group.id) : "";
    router.push(group.giaoAnId ? `${hrefXemGiaoAn(group.giaoAnId)}${href ? `&keHoachThang=${saved.id}&nhom=${group.id}` : ""}` : href);
  }
  async function moGiaoAnTuBang(id: string) {
    if (!plan || busy) return;
    const saved = dirty ? await save() : plan;
    if (!saved) return;
    const source = cacONoiDung(saved).find((c) => c.nhom.giaoAnId === id && c.nhom.nhom === "hoc" && c.nhom.tietHoc);
    router.push(`${hrefXemGiaoAn(id)}${source ? `&keHoachThang=${saved.id}&nhom=${source.nhom.id}` : ""}`);
  }
  async function ganGiaoAn(group: NoiDungNhom, lessonId: string | null) {
    if (!plan || busy) throw new Error("Cô đợi thao tác lưu hiện tại hoàn tất nhé.");
    const saved = dirty ? await save() : plan;
    if (!saved) throw new Error("Kế hoạch chưa lưu được. Cô kiểm tra thông báo và thử lại nhé.");
    setBusy(true); setError("");
    try {
      const next = await lienKetGiaoAnThang(saved.id, group.id, lessonId, group.giaoAnId ?? null);
      setPlan(next); setDirty(false); setChonGiaoAn(null); setMessage(lessonId ? "Đã gắn giáo án vào đúng ô kế hoạch." : "Đã bỏ liên kết. Giáo án vẫn còn trong thư viện.");
    } catch (e) { setError(loi(e)); throw e; }
    finally { setBusy(false); }
  }
  function updateGroup(group: NoiDungNhom) {
    if (!plan) return;
    const update = (groups: NoiDungNhom[]) => groups.map((g) => g.id === group.id ? group : g);
    change(viTri.cap === "thang" ? { ...plan, nhom: update(plan.nhom) } : { ...plan, tuan: plan.tuan.map((w) => w.id !== viTri.tuanId ? w : viTri.cap === "tuan" ? { ...w, nhom: update(w.nhom) } : { ...w, ngay: w.ngay.map((d) => d.id !== viTri.ngayId ? d : { ...d, nhom: update(d.nhom) }) }) });
  }
  async function applyCalendar() {
    if (!plan || !lich) return;
    try {
      const next = doiLichHoc(plan, lich);
      const removed = plan.tuan.flatMap((w) => w.ngay).filter((d) => !lich.ngayHoc.includes(d.ngay));
      if (removed.length && !(await xacNhan(`Lịch mới bỏ ${removed.length} ngày học. Nội dung riêng của các ngày bị bỏ và khối chung của tuần không còn ngày học sẽ bị xóa khỏi bản đang sửa. Cô tiếp tục nhé?`))) return;
      change(next); setViTri({ cap: "thang" }); setLich(null);
    } catch (e) { setError(loi(e)); }
  }
  const week = plan && viTri.cap !== "thang" ? plan.tuan.find((w) => w.id === viTri.tuanId) : undefined;
  const day = week && viTri.cap === "ngay" ? week.ngay.find((d) => d.id === viTri.ngayId) : undefined;
  const groups = viTri.cap === "thang" ? plan?.nhom : viTri.cap === "tuan" ? week?.nhom : day?.nhom;
  const scopeTitle = viTri.cap === "thang" ? "Nội dung chung cả tháng" : day ? `Nội dung riêng ${nhanNgay(day.ngay)}` : `Nội dung chung tuần ${week ? plan!.tuan.indexOf(week) + 1 : ""}`;
  const pendingGoals = plan ? cacONoiDung(plan).filter((o) => o.nhom.trangThai === "co-noi-dung" && !noiDungHieuLuc(plan, o.nhom.nhom, o.tuan, o.ngay).mucTieuIds.length) : [];
  const exportSnapshot = plan ? { ...plan, giaoVien: plan.giaoVien.map((s) => s.trim()).filter(Boolean) } : null;
  function xemBanIn() {
    if (!exportSnapshot) return;
    try { docKeHoachThang(exportSnapshot); setError(""); setPrintSnapshot(structuredClone(exportSnapshot)); }
    catch (e) { setError(loi(e)); }
  }

  return <>
    {hopThoai}
    <PageHeader title="Kế hoạch tháng" tinhNang="/ke-hoach-thang" lead="Bảy nhóm hoạt động, nội dung chung và ngày học cụ thể của lớp." actions={<><ButtonLink href="/thu-vien?loai=ke-hoach-thang" variant="phu">Thư viện tháng</ButtonLink>{plan && <Button type="button" variant="phu" disabled={busy} onClick={async () => { if (dirty && !(await xacNhan("Kế hoạch còn thay đổi chưa lưu. Cô muốn bỏ thay đổi và tạo tháng mới?", { nutDongY: "Bỏ và tạo mới" }))) return; setPlan(null); setDirty(false); setViTri({ cap: "thang" }); setError(""); setMessage(""); window.history.replaceState(null, "", "/ke-hoach-thang"); }}>Tạo tháng mới</Button>}</>} />
    {loading ? <p role="status">Đang tải kế hoạch tháng…</p> : loadError ? <div role="alert" className="space-y-3 rounded-the border border-vien bg-trang p-6"><p>{loadError}</p><Button type="button" onClick={() => setRetry((n) => n + 1)}>Thử tải lại</Button></div> : !plan ? <TaoThang onCreate={(p) => { change(p); setViTri({ cap: "thang" }); setView("edit"); }} /> : <>
      <div className="sticky top-14 z-10 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-o border border-vien bg-giay p-3 lg:top-0">
        <p role="status" className="text-sm text-muc-nhat">{busy ? "Đang lưu…" : dirty ? "Có thay đổi chưa lưu" : message || "Đã mở bản lưu"}</p>
        <div className="flex flex-wrap gap-2"><Button type="button" onClick={save} disabled={busy || !dirty}><Save size={18} aria-hidden="true" />{busy ? "Đang lưu…" : "Lưu kế hoạch tháng"}</Button><ActionMenu label="Tùy chọn kế hoạch"><Button type="button" variant="nhe" data-close-menu disabled={busy} onClick={xemBanIn}>Xem bản in</Button><NutTaiFile loai="ke-hoach-thang" data={exportSnapshot} tenFile={`Ke hoach giao duc thang ${plan.thang}`} variant="nhe" nhan="Tải Word tháng" /><NutTaiFile loai="ke-hoach-thang" dinhDang="pdf" data={exportSnapshot} tenFile={`Ke hoach giao duc thang ${plan.thang}`} variant="nhe" nhan="Tải PDF tháng" /><p className="px-4 py-2 text-sm text-muc-nhat">File lấy nội dung đang xem. Bấm Lưu kế hoạch tháng để giữ thay đổi trong thư viện.</p></ActionMenu></div>
      </div>
      {error && <p role="alert" className="mb-4 rounded-o bg-phan-nhat p-3 text-butdo">{error}</p>}
      <fieldset disabled={busy} className="min-w-0 space-y-6">
        <details open={view === "edit"} className="rounded-the border border-vien bg-trang">
          <summary className="cursor-pointer p-4 font-bold">Thiết lập kế hoạch <span className="ml-2 text-sm font-normal text-muc-nhat">Thông tin lớp · Bộ MT · Bản in{pendingGoals.length ? ` · ${pendingGoals.length} ô chưa gắn MT` : ""}</span></summary>
          <div className="space-y-4 border-t border-vien p-3 sm:p-4">
        <details className="rounded-the border border-vien bg-trang" open={view === "edit"}>
          <summary className="cursor-pointer p-4 font-bold">Thông tin tháng {plan.thang.slice(5, 7)}/{plan.thang.slice(0, 4)}</summary>
          <div className="grid gap-4 border-t border-vien p-4 sm:grid-cols-2">
            <Field label="Chủ đề tháng"><Input value={plan.chuDe} maxLength={200} onChange={(e) => change({ ...plan, chuDe: e.target.value })} /></Field>
            <Field label="Độ tuổi" hint={plan.boMucTieu ? "Gỡ bộ MT trước khi đổi độ tuổi để tránh dùng nhầm mục tiêu." : undefined}><select className={SELECT} disabled={Boolean(plan.boMucTieu)} value={plan.doTuoi} onChange={(e) => change({ ...plan, doTuoi: e.target.value as DoTuoi })}>{Object.entries(DO_TUOI_LABEL).map(([id, ten]) => <option key={id} value={id}>{ten}</option>)}</select></Field>
            <Field label="Tên lớp"><Input value={plan.tenLop} maxLength={200} onChange={(e) => change({ ...plan, tenLop: e.target.value })} /></Field>
            <Field label="Giáo viên chủ nhiệm" hint="Mỗi giáo viên một dòng."><Textarea rows={2} value={plan.giaoVien.join("\n")} maxLength={2000} onChange={(e) => change({ ...plan, giaoVien: e.target.value.split("\n") })} /></Field>
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><p className="text-sm text-muc-nhat">{nhanKhoang(plan.tuNgay, plan.denNgay)} · {plan.tuan.length} tuần · {plan.tuan.reduce((n, w) => n + w.ngay.length, 0)} ngày học</p><Button type="button" variant="nhe" onClick={() => { setError(""); setLich({ tuNgay: plan.tuNgay, denNgay: plan.denNgay, ngayHoc: plan.tuan.flatMap((w) => w.ngay.map((d) => d.ngay)) }); }}><CalendarDays size={16} aria-hidden="true" />Chỉnh lịch học</Button></div>
          </div>
        </details>
        <BoMucTieuEditor plan={plan} onChange={change} />
        <ThongTinInEditor plan={plan} onChange={change} />
        <details className="rounded-the border border-vien bg-trang p-4"><summary className="cursor-pointer font-semibold">Rà soát mục tiêu · {pendingGoals.length} ô có nội dung chưa gắn MT</summary><p className="mt-2 text-sm text-muc-nhat">Tính cả MT được dùng chung theo tháng/tuần. Ô chưa nhập và ô không áp dụng không tính vào danh sách này.</p><ul className="mt-2">{pendingGoals.map((o) => <li key={o.nhom.id}><Button type="button" variant="nhe" onClick={() => moO(o)}>{o.nhan} · {NHOM_HOAT_DONG.find((n) => n.id === o.nhom.nhom)!.ten}</Button></li>)}</ul></details>
          </div>
        </details>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Chế độ xem kế hoạch"><Button type="button" variant={view === "table" ? "chinh" : "phu"} aria-pressed={view === "table"} onClick={() => setView("table")}>Bảng tháng</Button><Button type="button" variant={view === "edit" ? "chinh" : "phu"} aria-pressed={view === "edit"} onClick={() => setView("edit")}>Chỉnh nội dung</Button></div>
        <div className={view === "table" ? "" : "hidden"}><BangThang plan={plan} onEdit={(id) => { const cell = cacONoiDung(plan).find((o) => o.nhom.id === id); if (cell) moO(cell); }} onLesson={moGiaoAnTuBang} /></div>
        <div className={view === "edit" ? "space-y-6" : "hidden"}>
        <div className="lg:hidden"><Field label="Chọn phạm vi nhập nội dung"><select className={SELECT} value={viTri.cap === "thang" ? "thang" : viTri.cap === "tuan" ? `tuan:${viTri.tuanId}` : `ngay:${viTri.tuanId}:${viTri.ngayId}`} onChange={(e) => { const [cap, tuanId, ngayId] = e.target.value.split(":"); setViTri(cap === "thang" ? { cap: "thang" } : cap === "tuan" ? { cap: "tuan", tuanId } : { cap: "ngay", tuanId, ngayId }); }}><option value="thang">Chung cả tháng</option>{plan.tuan.map((w, index) => <optgroup key={w.id} label={`Tuần ${index + 1} · ${nhanKhoang(w.tuNgay, w.denNgay)}`}><option value={`tuan:${w.id}`}>Chung cả tuần {index + 1}</option>{w.ngay.map((d) => <option key={d.id} value={`ngay:${w.id}:${d.id}`}>{nhanNgay(d.ngay)}</option>)}</optgroup>)}</select></Field></div>
        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
          <nav className="hidden space-y-3 rounded-the border border-vien bg-trang p-3 lg:block" aria-label="Phạm vi nội dung kế hoạch">
            <button type="button" aria-current={viTri.cap === "thang" ? "page" : undefined} className={`min-h-11 w-full rounded-o p-3 text-left font-semibold ${viTri.cap === "thang" ? "bg-bang-nhat text-bang" : "hover:bg-giay"}`} onClick={() => setViTri({ cap: "thang" })}>Chung cả tháng</button>
            {plan.tuan.map((w, i) => <details key={w.id} open className="border-t border-vien pt-2">
              <summary className="cursor-pointer py-2 text-sm font-bold">Tuần {i + 1} · {nhanKhoang(w.tuNgay, w.denNgay)}</summary>
              <button type="button" aria-current={viTri.cap === "tuan" && viTri.tuanId === w.id ? "page" : undefined} className={`min-h-11 w-full rounded-o px-3 text-left text-sm font-semibold ${viTri.cap === "tuan" && viTri.tuanId === w.id ? "bg-bang-nhat text-bang" : "hover:bg-giay"}`} onClick={() => setViTri({ cap: "tuan", tuanId: w.id })}>Chung cả tuần</button>
              <div className="flex flex-wrap gap-1 lg:block">{w.ngay.map((d) => <button key={d.id} type="button" aria-current={day?.id === d.id ? "page" : undefined} className={`min-h-11 rounded-o px-3 text-left text-sm lg:block lg:w-full ${day?.id === d.id ? "bg-bang-nhat font-semibold text-bang" : "text-muc-nhat hover:bg-giay"}`} onClick={() => setViTri({ cap: "ngay", tuanId: w.id, ngayId: d.id })}>{nhanNgay(d.ngay)}</button>)}</div>
            </details>)}
          </nav>
          <section className="min-w-0" key={JSON.stringify(viTri)}>
            <h2 className="text-xl font-bold">{scopeTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muc-nhat">{viTri.cap === "thang" ? "Nội dung ở đây dùng chung cho mọi ngày học. Nhập thay đổi theo tuần hoặc ngày ở mục tương ứng." : "Bổ sung để giữ nội dung chung; chọn thay thế khi chỉ dùng nội dung riêng. Mỗi phần có tên và nội dung riêng, giữ nguyên xuống dòng."}</p>
            {week && <div className="mt-4"><Field label="Chủ đề / sự kiện của tuần"><Input value={week.chuDe} maxLength={200} placeholder="Ví dụ: Ngày phụ nữ Việt Nam 20/10" onChange={(e) => change({ ...plan, tuan: plan.tuan.map((w) => w.id === week.id ? { ...w, chuDe: e.target.value } : w) })} /></Field></div>}
            <div className="mt-5 space-y-3">{NHOM_HOAT_DONG.map((n) => { const group = groups?.find((g) => g.nhom === n.id); return group && <NhomEditor key={group.id} value={group} cap={viTri.cap} onChange={updateGroup} bo={plan.boMucTieu} mo={activeGroup === group.id} onSoan={() => moGiaoAn(group)} onGan={() => setChonGiaoAn(group)} onBo={() => { ganGiaoAn(group, null).catch(() => {}); }} />; })}</div>
            {viTri.cap !== "thang" && <details className="mt-5 rounded-the border border-vien bg-trang p-4"><summary className="cursor-pointer font-semibold">Xem nội dung áp dụng cho {TEN_CAP[viTri.cap]} này</summary><NoiDungApDung plan={plan} week={week} day={day} onEdit={moO} onLesson={moGiaoAn} /></details>}
          </section>
        </div>
        </div>
      </fieldset>
      {printSnapshot && <BanInThang plan={printSnapshot} onClose={() => setPrintSnapshot(null)} />}
      {chonGiaoAn && <Modal title="Gắn giáo án đã lưu vào ô" onClose={() => { if (!busy) setChonGiaoAn(null); }}><ChonGiaoAn doTuoi={plan.doTuoi} onChoose={(id) => ganGiaoAn(chonGiaoAn, id)} /></Modal>}
      {lich && <Modal title="Chỉnh lịch học của tháng" onClose={() => setLich(null)}><div className="space-y-4 p-4"><ChonLich thang={plan.thang} value={lich} onChange={setLich} />{error && <p role="alert" className="text-butdo">{error}</p>}<p className="text-sm text-muc-nhat">Các ngày còn trong lịch giữ nguyên nội dung. Thêm ngày mới tạo đủ bảy nhóm chưa nhập.</p><div className="flex flex-wrap gap-2"><Button type="button" disabled={!lich.ngayHoc.length} onClick={applyCalendar}>Áp dụng lịch học</Button><Button type="button" variant="phu" onClick={() => setLich(null)}>Hủy</Button></div></div></Modal>}
    </>}
  </>;
}

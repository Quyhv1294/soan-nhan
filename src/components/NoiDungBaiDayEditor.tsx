"use client";

import { Button, Field, Input, Select, Textarea } from "./ui";
import { DO_TUOI_LABEL, LINH_VUC, type DoTuoi, type GiaoAnMamNon, type KeHoachBaiDay } from "@/lib/types";
import { suaTruong } from "@/lib/ban-soan";

function Chu({ label, value, onChange, required = true, multiline = false }: { label: string; value?: string; onChange: (value: string) => void; required?: boolean; multiline?: boolean }) {
  return <Field label={label}>{multiline ? <Textarea rows={3} value={value ?? ""} required={required} onChange={(e) => onChange(e.target.value)} /> : <Input value={value ?? ""} required={required} onChange={(e) => onChange(e.target.value)} />}</Field>;
}
function DanhSach({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  return <Field label={label} hint="Mỗi dòng một ý."><Textarea rows={Math.min(8, Math.max(3, value.length + 1))} value={value.join("\n")} required onChange={(e) => onChange(e.target.value.split("\n"))} /></Field>;
}
const SECTION = "rounded-the border border-vien bg-giay/60 p-4 sm:p-5 space-y-4";

export function GiaoAnNoiDungEditor({ data, onChange }: { data: GiaoAnMamNon; onChange: (data: GiaoAnMamNon) => void }) {
  const set = (path: (string | number)[], value: unknown) => onChange(suaTruong(data, path, value));
  return <div className="space-y-5">
    <fieldset className={SECTION}><legend className="px-1 font-bold">Thông tin giáo án</legend>
      <Chu label="Tên hoạt động" value={data.tenHoatDong} onChange={(v) => set(["tenHoatDong"], v)} />
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Lĩnh vực"><Select options={[...LINH_VUC]} value={data.linhVuc} onChange={(e) => set(["linhVuc"], e.target.value)} /></Field><Field label="Độ tuổi"><Select options={Object.values(DO_TUOI_LABEL)} value={DO_TUOI_LABEL[data.doTuoi]} onChange={(e) => set(["doTuoi"], (Object.keys(DO_TUOI_LABEL) as DoTuoi[]).find((key) => DO_TUOI_LABEL[key] === e.target.value))} /></Field></div>
      <Chu label="Chủ đề" value={data.chuDe} required={false} onChange={(v) => set(["chuDe"], v)} />
      <Chu label="Thời lượng" value={data.thoiLuong} onChange={(v) => set(["thoiLuong"], v)} />
    </fieldset>
    <fieldset className={SECTION}><legend className="px-1 font-bold">I. Mục đích, yêu cầu</legend>
      {([['kienThuc', 'Kiến thức'], ['kyNang', 'Kỹ năng'], ['thaiDo', 'Thái độ']] as const).map(([key, label]) => <DanhSach key={key} label={label} value={data.mucDich[key]} onChange={(v) => set(["mucDich", key], v)} />)}
    </fieldset>
    <fieldset className={SECTION}><legend className="px-1 font-bold">II. Chuẩn bị</legend>
      <DanhSach label="Đồ dùng của cô" value={data.chuanBi.cuaCo} onChange={(v) => set(["chuanBi", "cuaCo"], v)} />
      <DanhSach label="Đồ dùng của trẻ" value={data.chuanBi.cuaTre} onChange={(v) => set(["chuanBi", "cuaTre"], v)} />
      <Chu label="Địa điểm (không bắt buộc)" value={data.chuanBi.diaDiem} required={false} onChange={(v) => set(["chuanBi", "diaDiem"], v)} />
    </fieldset>
    <section className={SECTION}><h3 className="font-bold">III. Tiến hành</h3>
      {data.tienHanh.map((hd, i) => <fieldset key={i} className="space-y-4 rounded-o border border-vien bg-trang p-4"><legend className="px-1 text-sm font-semibold">Hoạt động {i + 1}</legend>
        <Chu label={`Tên hoạt động ${i + 1}`} value={hd.ten} onChange={(v) => set(["tienHanh", i, "ten"], v)} />
        {hd.buoc.map((buoc, j) => <div key={j} className="space-y-3 border-t border-vien pt-4">
          <Chu label={`Thời gian bước ${j + 1}`} value={buoc.thoiGian} onChange={(v) => set(["tienHanh", i, "buoc", j, "thoiGian"], v)} />
          <DanhSach label="Hoạt động của cô" value={buoc.hoatDongCo} onChange={(v) => set(["tienHanh", i, "buoc", j, "hoatDongCo"], v)} />
          <DanhSach label="Hoạt động của trẻ" value={buoc.hoatDongTre} onChange={(v) => set(["tienHanh", i, "buoc", j, "hoatDongTre"], v)} />
          {hd.buoc.length > 1 && <Button type="button" variant="nhe" onClick={() => set(["tienHanh", i, "buoc"], hd.buoc.filter((_, n) => n !== j))}>Xóa bước {j + 1}</Button>}
        </div>)}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="phu" onClick={() => set(["tienHanh", i, "buoc"], [...hd.buoc, { thoiGian: "", hoatDongCo: [""], hoatDongTre: [""] }])}>Thêm bước</Button>{data.tienHanh.length > 1 && <Button type="button" variant="nhe" onClick={() => set(["tienHanh"], data.tienHanh.filter((_, n) => n !== i))}>Xóa hoạt động {i + 1}</Button>}</div>
      </fieldset>)}
      <Button type="button" variant="phu" onClick={() => set(["tienHanh"], [...data.tienHanh, { ten: "", buoc: [{ thoiGian: "", hoatDongCo: [""], hoatDongTre: [""] }] }])}>Thêm hoạt động</Button>
    </section>
  </div>;
}

export function KhbdNoiDungEditor({ data, onChange }: { data: KeHoachBaiDay; onChange: (data: KeHoachBaiDay) => void }) {
  const set = (path: (string | number)[], value: unknown) => onChange(suaTruong(data, path, value));
  return <div className="space-y-5">
    <fieldset className={SECTION}><legend className="px-1 font-bold">Thông tin bài dạy</legend>
      <Chu label="Tên bài" value={data.tenBai} onChange={(v) => set(["tenBai"], v)} />
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Lớp"><Select options={["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"]} value={`Lớp ${data.lop}`} onChange={(e) => set(["lop"], Number(e.target.value.slice(-1)))} /></Field><Field label="Môn"><Select options={["Toán", "Tiếng Việt"]} value={data.mon} onChange={(e) => set(["mon"], e.target.value)} /></Field></div>
      <Chu label="Bộ sách" value={data.boSach} onChange={(v) => set(["boSach"], v)} />
      <Chu label="Tiết (không bắt buộc)" value={data.tiet} required={false} onChange={(v) => set(["tiet"], v)} />
    </fieldset>
    <fieldset className={SECTION}><legend className="px-1 font-bold">I. Yêu cầu cần đạt</legend>
      {([['nangLucDacThu', 'Năng lực đặc thù'], ['nangLucChung', 'Năng lực chung'], ['phamChat', 'Phẩm chất']] as const).map(([key, label]) => <DanhSach key={key} label={label} value={data.yeuCauCanDat[key]} onChange={(v) => set(["yeuCauCanDat", key], v)} />)}
    </fieldset>
    <fieldset className={SECTION}><legend className="px-1 font-bold">II. Đồ dùng dạy học</legend><DanhSach label="Giáo viên" value={data.doDung.giaoVien} onChange={(v) => set(["doDung", "giaoVien"], v)} /><DanhSach label="Học sinh" value={data.doDung.hocSinh} onChange={(v) => set(["doDung", "hocSinh"], v)} /></fieldset>
    <section className={SECTION}><h3 className="font-bold">III. Hoạt động dạy học</h3>
      {data.hoatDong.map((hd, i) => <fieldset key={i} className="space-y-4 rounded-o border border-vien bg-trang p-4"><legend className="px-1 text-sm font-semibold">Hoạt động {i + 1}</legend>
        <Chu label={`Tên hoạt động ${i + 1}`} value={hd.ten} onChange={(v) => set(["hoatDong", i, "ten"], v)} />
        <Chu label="Mục tiêu" value={hd.mucTieu} multiline onChange={(v) => set(["hoatDong", i, "mucTieu"], v)} />
        <DanhSach label="Hoạt động của giáo viên" value={hd.giaoVien} onChange={(v) => set(["hoatDong", i, "giaoVien"], v)} />
        <DanhSach label="Hoạt động của học sinh" value={hd.hocSinh} onChange={(v) => set(["hoatDong", i, "hocSinh"], v)} />
        {data.hoatDong.length > 1 && <Button type="button" variant="nhe" onClick={() => set(["hoatDong"], data.hoatDong.filter((_, n) => n !== i))}>Xóa hoạt động {i + 1}</Button>}
      </fieldset>)}
      <Button type="button" variant="phu" onClick={() => set(["hoatDong"], [...data.hoatDong, { ten: "", mucTieu: "", giaoVien: [""], hocSinh: [""] }])}>Thêm hoạt động</Button>
    </section>
    <fieldset className={SECTION}><legend className="px-1 font-bold">IV. Điều chỉnh sau bài dạy</legend><Chu label="Nội dung điều chỉnh" value={data.dieuChinh} multiline required={false} onChange={(v) => set(["dieuChinh"], v)} /></fieldset>
  </div>;
}

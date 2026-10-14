"use client";

import { Field, Input, Textarea } from "@/components/ui";
import { MAU_IN_MAC_DINH, THONG_TIN_IN_TRONG } from "@/lib/bang-ke-hoach-thang";
import type { KeHoachThang } from "@/lib/types";

const SELECT = "min-h-11 w-full rounded-o border border-vien-nhap bg-trang px-3 text-base focus:outline-bang";
export function ThongTinInEditor({ plan, onChange }: { plan: KeHoachThang; onChange: (p: KeHoachThang) => void }) {
  const f = plan.trinhBay ?? MAU_IN_MAC_DINH;
  const info = plan.thongTinIn ?? THONG_TIN_IN_TRONG;
  const dg = plan.danhGia ?? { giaoVien: "", banGiamHieu: "" };
  return <details className="rounded-the border border-vien bg-trang">
    <summary className="cursor-pointer p-4 font-bold">Thông tin và định dạng bản in <span className="font-normal text-muc-nhat">· {f.khoGiay} ngang · {f.coChu}pt</span></summary>
    <div className="space-y-5 border-t border-vien p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Khổ giấy"><select className={SELECT} value={f.khoGiay} onChange={(e) => onChange({ ...plan, trinhBay: { ...f, khoGiay: e.target.value as "Letter" | "A4" } })}><option value="Letter">Letter ngang (như mẫu)</option><option value="A4">A4 ngang</option></select></Field>
        <Field label="Cỡ chữ nội dung"><select className={SELECT} value={f.coChu} onChange={(e) => onChange({ ...plan, trinhBay: { ...f, coChu: Number(e.target.value) as 12 | 13 | 14 } })}>{[12, 13, 14].map((size) => <option key={size} value={size}>{size}pt{size === 14 ? " (theo mẫu)" : ""}</option>)}</select></Field>
        {([['tenTruong', 'Tên trường'], ['toKhoi', 'Tổ / khối'], ['namHoc', 'Năm học'], ['diaDanh', 'Địa danh'], ['banGiamHieu', 'Họ tên ban giám hiệu'], ['khoiTruong', 'Họ tên khối trưởng']] as const).map(([key, label]) => <Field key={key} label={`${label} (không bắt buộc)`}><Input value={info[key]} maxLength={200} onChange={(e) => onChange({ ...plan, thongTinIn: { ...info, [key]: e.target.value } })} /></Field>)}
        <Field label="Ngày lập văn bản (không bắt buộc)"><Input type="date" min="1900-01-01" max="9999-12-31" value={info.ngayLap} onChange={(e) => onChange({ ...plan, thongTinIn: { ...info, ngayLap: e.target.value } })} /></Field>
      </div>
      <p className="text-sm text-muc-nhat">Times New Roman; lề trên/dưới 2cm, trái 3cm, phải 1,5cm. Chỗ ký để trống; họ tên và ngày do cô nhập để trình bày văn bản.</p>
      <Field label="Đánh giá của giáo viên" hint="Để trống nếu chưa có đánh giá thực tế."><Textarea rows={4} maxLength={20_000} value={dg.giaoVien} onChange={(e) => onChange({ ...plan, danhGia: { ...dg, giaoVien: e.target.value } })} /></Field>
      <Field label="Đánh giá của ban giám hiệu" hint="Nội dung do người đánh giá cung cấp."><Textarea rows={4} maxLength={20_000} value={dg.banGiamHieu} onChange={(e) => onChange({ ...plan, danhGia: { ...dg, banGiamHieu: e.target.value } })} /></Field>
    </div>
  </details>;
}

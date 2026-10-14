"use client";

import { KhbdPreview } from "@/components/GiaoAnPreview";
import { NutTaiFile } from "@/components/NutTaiFile";
import { SoanBai } from "@/components/SoanBai";
import { KhbdNoiDungEditor } from "@/components/NoiDungBaiDayEditor";
import { Button, Field, Input, Select } from "@/components/ui";
import type { KeHoachBaiDay } from "@/lib/types";
import { useHoSo } from "@/lib/use-ho-so";

export function KhbdEditor({ initial }: { initial: KeHoachBaiDay | null }) {
  const { profile, daNap, error } = useHoSo();
  if (!daNap) return <p role="status">Đang lấy thông tin lớp…</p>;
  const grade = profile.capHoc === "tieu-hoc" ? Number(profile.doTuoi.replace(/\D/g, "")) || 1 : 1;
  return (
    <SoanBai<KeHoachBaiDay>
      loai="khbd"
      initial={initial}
      render={(k) => <KhbdPreview k={k} />}
      renderEditor={(k, onChange) => <KhbdNoiDungEditor data={k} onChange={onChange} />}
      actions={(kh) => (
        <>
          <p className="px-4 pb-1 pt-3 text-sm font-semibold text-muc-nhat">Tải và in</p>
          <NutTaiFile loai="khbd" data={kh} tenFile={`KHBD - ${kh.tenBai}`} variant="nhe" />
          <NutTaiFile loai="khbd" dinhDang="pdf" data={kh} tenFile={`KHBD - ${kh.tenBai}`} variant="nhe" />
          <Button type="button" variant="nhe" onClick={() => window.print()}>In</Button>
        </>
      )}
      form={(current) =>
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lớp">
              <Select name="lop" options={["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"]} defaultValue={`Lớp ${current?.lop ?? grade}`} />
            </Field>
            <Field label="Môn">
              <Select name="mon" options={["Toán", "Tiếng Việt"]} defaultValue={current?.mon} />
            </Field>
          </div>
          <Field label="Bộ sách">
            <Select name="boSach" options={["Kết nối tri thức", "Chân trời sáng tạo", "Cánh Diều"]} defaultValue={current?.boSach ?? (profile.boSach === "Không áp dụng" ? "Kết nối tri thức" : profile.boSach)} />
          </Field>
          <Field label="Tên bài">
            <Input name="tenBai" defaultValue={current?.tenBai} placeholder="Phép cộng có nhớ trong phạm vi 100" required />
          </Field>
          <Field label="Tiết (không bắt buộc)">
            <Input name="tiet" defaultValue={current?.tiet} placeholder="Tiết 1" />
          </Field>
          <p className="text-sm text-muc-nhat">{error || `Đã điền sẵn lớp và bộ sách từ hồ sơ${profile.tenLop ? ` ${profile.tenLop}` : " lớp"}.`}</p>
        </>
      }
    />
  );
}

"use client";

import Link from "next/link";
import { GiaoAnPreview } from "@/components/GiaoAnPreview";
import { NutTaiFile } from "@/components/NutTaiFile";
import { SoanBai } from "@/components/SoanBai";
import { GiaoAnNoiDungEditor } from "@/components/NoiDungBaiDayEditor";
import { Button, Field, Input, Select } from "@/components/ui";
import { DO_TUOI_LABEL, LINH_VUC, type GiaoAnMamNon, type NguCanhGiaoAnThang } from "@/lib/types";
import { useHoSo } from "@/lib/use-ho-so";
import { useTuan } from "@/lib/use-tuan";
import { demoAllowed } from "@/lib/supabase/configured";
import { GanLaiVaoKeHoach } from "./LienKetSauLuu";
import { LOAI_TIET, nhanMucTieu, TINH_TRANG_TIET } from "@/lib/muc-tieu";
import { hrefOThang } from "@/lib/lien-ket-thang";

export function GiaoAnEditor({ initial, tenHoatDong, context, nguCanhThang, expectedGiaoAnId = null }: { initial: GiaoAnMamNon | null; tenHoatDong?: string; context?: { chuDe?: string; doTuoi?: string; linhVuc?: string; hoatDong?: string }; nguCanhThang?: NguCanhGiaoAnThang; expectedGiaoAnId?: string | null }) {
  const { profile, daNap: profileReady, error } = useHoSo();
  const { tuan, daNap: planReady } = useTuan();
  const activity = context?.hoatDong ? tuan.ngay.flatMap((n) => n.hoatDong).find((h) => h.id === context.hoatDong) : undefined;
  if (!profileReady || (!nguCanhThang && !planReady)) return <p role="status">Đang lấy thông tin lớp và kế hoạch…</p>;
  return (
    <SoanBai<GiaoAnMamNon>
      loai="giao-an"
      initial={initial}
      afterSave={nguCanhThang ? (ga) => <GanLaiVaoKeHoach ga={ga} context={nguCanhThang} expectedId={expectedGiaoAnId} /> : undefined}
      render={(ga) => <GiaoAnPreview ga={ga} />}
      renderEditor={(ga, onChange) => <GiaoAnNoiDungEditor data={ga} onChange={onChange} />}
      actions={(ga) => (
        <>
          {ga.nguCanhKeHoach && <Link href={hrefOThang(ga.nguCanhKeHoach.keHoachId, ga.nguCanhKeHoach.nhomId)}>Mở ô kế hoạch nguồn</Link>}
          {nguCanhThang && <>
            <input type="hidden" name="keHoachThangId" value={nguCanhThang.keHoachId} />
            <input type="hidden" name="nhomId" value={nguCanhThang.nhomId} />
            {demoAllowed() && <input type="hidden" name="nguCanhDemo" value={JSON.stringify(nguCanhThang)} />}
            <div className="space-y-2 rounded-o bg-bang-nhat p-3 text-sm"><p className="font-semibold">{LOAI_TIET[nguCanhThang.tietHoc.loai].ten} · {TINH_TRANG_TIET[nguCanhThang.tietHoc.tinhTrang]}</p>{nguCanhThang.tietHoc.tiet && <p>{nguCanhThang.tietHoc.tiet}</p>}<p>{nguCanhThang.mucTieu.map(nhanMucTieu).join(", ") || "Chưa gắn MT"}</p><details><summary className="cursor-pointer">Nội dung đã lấy từ kế hoạch</summary>{nguCanhThang.phan.map((p, index) => <p key={index} className="mt-2 whitespace-pre-wrap"><b>{p.tieuDe}</b>{p.tieuDe ? ": " : ""}{p.noiDung}</p>)}</details></div>
          </>}
          <p className="px-4 pb-1 pt-3 text-sm font-semibold text-muc-nhat">Tải và in</p>
          <NutTaiFile loai="giao-an" data={ga} tenFile={`Giao an - ${ga.tenHoatDong}`} variant="nhe" />
          <NutTaiFile loai="giao-an" dinhDang="pdf" data={ga} tenFile={`Giao an - ${ga.tenHoatDong}`} variant="nhe" />
          <Button type="button" variant="nhe" onClick={() => window.print()}>In</Button>
          <p className="mt-2 border-t border-vien px-4 pb-1 pt-3 text-sm font-semibold text-muc-nhat">Tạo thêm cho lớp</p>
          <Link href="/phieu-hoc-tap">
            Tạo phiếu học tập
          </Link>
          <Link href="/tro-choi">
            Tạo trò chơi
          </Link>
        </>
      )}
      form={(current) =>
        <>
          <Field label="Tên hoạt động">
            <Input name="tenHoatDong" defaultValue={current?.tenHoatDong ?? tenHoatDong ?? activity?.ten} placeholder="Nhận biết hình tròn, hình vuông" required />
          </Field>
          <Field label="Lĩnh vực">
            <Select name="linhVuc" options={[...LINH_VUC]} defaultValue={current?.linhVuc ?? nguCanhThang?.tietHoc.linhVuc ?? context?.linhVuc ?? activity?.linhVuc ?? LINH_VUC[1]} />
          </Field>
          <Field label="Chủ đề">
            <Input name="chuDe" defaultValue={current?.chuDe ?? nguCanhThang?.chuDe ?? context?.chuDe ?? tuan.chuDe} />
          </Field>
          <Field label="Độ tuổi">
            {nguCanhThang ? <Input name="doTuoi" value={DO_TUOI_LABEL[nguCanhThang.doTuoi]} readOnly /> : <Select name="doTuoi" options={Object.values(DO_TUOI_LABEL)} defaultValue={current ? DO_TUOI_LABEL[current.doTuoi] : context?.doTuoi ?? (activity ? DO_TUOI_LABEL[tuan.doTuoi] : profile.capHoc === "mam-non" ? profile.doTuoi : DO_TUOI_LABEL[tuan.doTuoi])} />}
          </Field>
          <Field label="Phương pháp (không bắt buộc)" hint="Ví dụ: trò chơi, khám phá, STEAM, dự án">
            <Input name="phuongPhap" placeholder="Trò chơi" defaultValue={nguCanhThang?.tietHoc.phuongPhap} />
          </Field>
          <p className="text-sm text-muc-nhat">{error || `Đã điền sẵn theo ${nguCanhThang ? "ô trong kế hoạch tháng" : context?.hoatDong ? "hoạt động trong kế hoạch tuần" : profile.tenLop || "hồ sơ lớp"}. Cô có thể thay đổi trước khi soạn.`}</p>
        </>
      }
    />
  );
}

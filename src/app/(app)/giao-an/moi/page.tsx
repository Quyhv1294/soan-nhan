import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { MOCK_GIAO_AN, MOCK_TUAN } from "@/lib/mock-data";
import { GiaoAnEditor } from "./GiaoAnEditor";
import { loadDocument } from "@/lib/supabase/data";
import type { GiaoAnMamNon } from "@/lib/types";
import { GiaoAnTuThang } from "./GiaoAnTuThang";

export const metadata: Metadata = { title: "Soạn giáo án mầm non" };

// F3 — Soạn giáo án mầm non.
// ?id=…       mở giáo án đã lưu trong tài khoản hoặc bản demo cục bộ
// ?hoatDong=… điền sẵn tên hoạt động từ kế hoạch tuần
export default async function SoanGiaoAn({ searchParams }: { searchParams: Promise<{ id?: string; hoatDong?: string; ten?: string; chuDe?: string; doTuoi?: string; linhVuc?: string; keHoachThang?: string; nhom?: string }> }) {
  const { id, hoatDong, ten, chuDe, doTuoi, linhVuc, keHoachThang, nhom } = await searchParams;
  const initial = id === MOCK_GIAO_AN.id ? MOCK_GIAO_AN : id ? await loadDocument<GiaoAnMamNon>(id, "giao-an") : null;
  const tenHoatDong = ten ?? (hoatDong
    ? MOCK_TUAN.ngay.flatMap((n) => n.hoatDong).find((h) => h.id === hoatDong)?.ten
    : undefined);

  return (
    <>
      <PageHeader
        tinhNang="/giao-an/moi"
        title={initial ? initial.tenHoatDong : "Soạn giáo án mầm non"}
        lead="Giáo án theo bảng 3 cột: thời gian, hoạt động của cô, hoạt động của trẻ."
      />
      {/* key: đổi ?id / ?hoatDong thì dựng lại trình soạn, không giữ bản cũ */}
      {keHoachThang && nhom ? <GiaoAnTuThang key={`${id ?? ""}|${keHoachThang}|${nhom}`} initial={initial} planId={keHoachThang} nhomId={nhom} /> : <GiaoAnEditor key={`${id ?? ""}|${hoatDong ?? ""}|${ten ?? ""}`} initial={initial} tenHoatDong={tenHoatDong} context={{ hoatDong, chuDe, doTuoi, linhVuc }} />}
    </>
  );
}

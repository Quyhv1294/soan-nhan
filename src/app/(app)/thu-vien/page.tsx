import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui";
import type { LoaiTaiLieu, TaiLieu } from "@/lib/types";
import { ThuVienDanhSach } from "./ThuVienDanhSach";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";

export const metadata: Metadata = { title: "Thư viện của tôi" };

export default async function ThuVien() {
  const demo = demoAllowed();
  let documents: TaiLieu[] = [];
  let error = "";
  if (!demo) {
    const supabase = await createClient();
    const result = await supabase.from("documents").select("id,loai,tieu_de,chu_de,cap_nhat").order("cap_nhat", { ascending: false }).limit(200);
    if (result.error) error = "Chưa tải được thư viện. Cô thử tải lại danh sách nhé.";
    documents = (result.data ?? []).map((d) => ({ id: d.id, loai: d.loai as LoaiTaiLieu, tieuDe: d.tieu_de, chuDe: d.chu_de ?? "", capNhat: d.cap_nhat }));
  }
  return <><PageHeader tinhNang="/thu-vien" title="Thư viện của tôi" lead="Tìm, sắp xếp và quản lý tài liệu cô đã lưu." /><Suspense fallback={<p role="status">Đang tải thư viện…</p>}><ThuVienDanhSach initial={documents} demo={demo} initialError={error} /></Suspense></>;
}

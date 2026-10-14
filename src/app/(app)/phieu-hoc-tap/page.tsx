import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { PhieuEditor } from "./PhieuEditor";

export const metadata: Metadata = { title: "Phiếu học tập" };

// F5 — Phiếu học tập in A4: xuất PDF qua POST /api/export/pdf.
export default async function PhieuHocTap({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <>
      <PageHeader tinhNang="/phieu-hoc-tap" title="Phiếu học tập" lead="Tạo bài tập mới bằng AI theo chủ đề và độ tuổi, hoặc dùng 12 mẫu có sẵn. Xem trước rồi tải PDF A4 để in." />
      <PhieuEditor key={id ?? "new"} />
    </>
  );
}

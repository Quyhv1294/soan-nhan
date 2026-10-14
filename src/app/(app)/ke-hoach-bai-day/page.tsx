import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { MOCK_KHBD } from "@/lib/mock-data";
import { KhbdEditor } from "./KhbdEditor";
import { loadDocument } from "@/lib/supabase/data";
import type { KeHoachBaiDay } from "@/lib/types";

export const metadata: Metadata = { title: "Kế hoạch bài dạy" };

// F4 — Kế hoạch bài dạy tiểu học theo khung Công văn 2345.
export default async function KeHoachBaiDay({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const initial = id === MOCK_KHBD.id ? MOCK_KHBD : id ? await loadDocument<KeHoachBaiDay>(id, "khbd") : null;
  return (
    <>
      <PageHeader
        tinhNang="/ke-hoach-bai-day"
        title="Kế hoạch bài dạy"
        lead="Toán và Tiếng Việt lớp 1–5, theo khung Công văn 2345: yêu cầu cần đạt, đồ dùng, hoạt động dạy học, điều chỉnh sau bài dạy."
      />
      <KhbdEditor key={id ?? ""} initial={initial} />
    </>
  );
}

import type { Metadata } from "next";
import { KeHoachTuanView } from "./KeHoachTuanView";

export const metadata: Metadata = { title: "Kế hoạch tuần" };

// F2 — Kế hoạch tuần theo chủ đề. Dữ liệu nằm trong trình duyệt (xem lib/kho-local.ts) cho đến khi nối Supabase.
export default async function KeHoachTuan({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <KeHoachTuanView key={id ?? "current"} />;
}

import type { Metadata } from "next";
import { KeHoachThangView } from "./KeHoachThangView";

export const metadata: Metadata = { title: "Kế hoạch tháng" };

export default async function KeHoachThangPage({ searchParams }: { searchParams: Promise<{ id?: string; nhom?: string }> }) {
  const { id, nhom } = await searchParams;
  return <KeHoachThangView key={`${id ?? "new"}|${nhom ?? ""}`} documentId={id} nhomId={nhom} />;
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { TroChoiEditor } from "./TroChoiEditor";

export const metadata: Metadata = { title: "Trò chơi lớp học" };

export default async function TroChoi({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <>
    <PageHeader tinhNang="/tro-choi" title="Trò chơi lớp học" lead="AI tạo câu hỏi, thẻ và nhiệm vụ mới theo chủ đề của cô. Chỉnh sửa, lưu và trình chiếu với 7 kiểu trò chơi." />
    <TroChoiEditor key={id ?? "new"} initial={null} />
  </>;
}

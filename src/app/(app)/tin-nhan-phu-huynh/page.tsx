import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { TinNhanEditor } from "./TinNhanEditor";

export const metadata: Metadata = { title: "Tin nhắn phụ huynh" };

// F7 — Tin nhắn phụ huynh: soạn từ kế hoạch tuần, sao chép một chạm để dán vào nhóm Zalo.
export default function TinNhanPhuHuynh() {
  return (
    <>
      <PageHeader tinhNang="/tin-nhan-phu-huynh" title="Tin nhắn phụ huynh" lead="Soạn từ kế hoạch tuần. Sửa trực tiếp rồi sao chép, dán vào nhóm Zalo của lớp." />
      <TinNhanEditor />
    </>
  );
}

import type { Metadata } from "next";
import { Logo } from "@/components/ui";
import { HoSoLopForm } from "@/components/HoSoLopForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Hồ sơ lớp" };

// F1 — Hồ sơ lớp: chỉ hỏi những gì AI cần để soạn đúng. Lưu vào bảng users.
export default function BatDau() {
  return (
    <div className="min-h-dvh">
      <div className="o-ly h-44 border-b border-oly-dam" aria-hidden="true" />
      <div className="px-4 -mt-32 pb-12">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-3"><Logo /><ThemeToggle compact /></div>
          <div className="relative mt-6 rounded-[20px] border border-vien bg-trang p-6 sm:p-8 shadow-noi">
            <span className="bang-dinh -top-3 left-1/2 -translate-x-1/2 -rotate-2" aria-hidden="true" />
            <div className="flex items-center gap-2 text-[13px] font-semibold text-muc-nhat">
              <span className="h-1.5 w-8 rounded-full bg-bang" aria-hidden="true" />
              <span className="h-1.5 w-8 rounded-full bg-bang" aria-hidden="true" />
              <span className="ml-1">Bước 2/2</span>
            </div>
            <h1 className="mt-4 text-[28px] font-bold tracking-tight">Cô dạy lớp nào?</h1>
            <p className="mt-1.5 text-muc-nhat">Chọn thông tin lớp để bài soạn phù hợp với lớp của cô. Có thể đổi lại trong Tài khoản.</p>

            <HoSoLopForm />
          </div>
        </div>
      </div>
    </div>
  );
}

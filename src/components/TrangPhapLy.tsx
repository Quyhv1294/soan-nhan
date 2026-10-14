import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./ui";
import { ThemeToggle } from "./ThemeToggle";

// Khung chung cho trang điều khoản và quyền riêng tư (nội dung tạm, chờ bản chính thức).
export function TrangPhapLy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3"><Link href="/">
          <Logo />
        </Link><ThemeToggle compact /></div>
        <h1 className="mt-10 text-[28px] font-bold tracking-tight">{title}</h1>
        <div className="mt-6 space-y-4 text-muc-nhat leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

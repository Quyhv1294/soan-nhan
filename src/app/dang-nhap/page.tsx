import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/ui";
import { SITE } from "@/lib/site";
import { DangNhapForm } from "@/components/DangNhapForm";
import { demoAllowed, supabaseConfigured } from "@/lib/supabase/configured";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Đăng nhập" };

// F1 — Đăng nhập Google hoặc magic link qua email.
export default function DangNhap() {
  return (
    <div className="min-h-dvh grid lg:grid-cols-[1.05fr_1fr]">
      {/* Bảng phấn bên trái: lời chào của lớp học */}
      <div className="bang-phan hidden lg:flex flex-col justify-between p-12 text-white">
        <Link href="/">
          <Logo nenToi />
        </Link>
        <div className="max-w-md">
          <p className="font-tay text-[44px] leading-[1.05] text-phan">Chào cô, tối nay mình soạn bài cùng nhau nhé!</p>
          <ul className="mt-8 space-y-3 text-[17px] text-white/85">
            {["Chọn chủ đề tuần, có ngay kế hoạch 5 ngày", "Giáo án 3 cột, KHBD theo Công văn 2345", "Tải Word, in A4, gửi Zalo phụ huynh"].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 rounded-full bg-phan text-muc grid place-items-center shrink-0" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[13px] text-white/75">© 2026 {SITE.name}</p>
      </div>

      <div className="flex flex-col px-4 sm:px-10 py-8 bg-giay">
        <div className="flex items-center justify-between gap-3"><Link href="/" className="lg:hidden">
          <Logo />
        </Link><div className="ml-auto"><ThemeToggle compact /></div></div>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[400px] mx-auto rounded-[20px] border border-vien bg-trang p-6 sm:p-8 shadow-noi my-8">
            <h1 className="text-[26px] font-bold tracking-tight">Đăng nhập</h1>
            <p className="mt-1.5 text-muc-nhat">Dùng tài khoản Google để vào nhanh nhất.</p>

            <DangNhapForm configured={supabaseConfigured} allowDemo={demoAllowed()} />

            <p className="mt-6 text-[13px] text-muc-nhat leading-relaxed">
              Khi tiếp tục, cô đồng ý với <Link href="/dieu-khoan" className="underline hover:text-muc">Điều khoản sử dụng</Link> và{" "}
              <Link href="/quyen-rieng-tu" className="underline hover:text-muc">Chính sách quyền riêng tư</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

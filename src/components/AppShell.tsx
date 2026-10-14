"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Grid2X2 } from "lucide-react";
import { useHoSo } from "@/lib/use-ho-so";
import { Modal } from "./Modal";
import type { ReactNode } from "react";
import { APP_NAV, SITE } from "@/lib/site";
import { TINH_NANG } from "./TinhNang";
import { Logo } from "./ui";
import { ThemeToggle } from "./ThemeToggle";

const NHOM: { key: "chung" | "mam-non" | "tieu-hoc"; label: string }[] = [
  { key: "mam-non", label: "Mầm non" },
  { key: "tieu-hoc", label: "Tiểu học" },
  { key: "chung", label: "Dùng chung" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authoring = ["/giao-an/", "/ke-hoach-bai-day", "/ke-hoach-tuan", "/ke-hoach-thang", "/phieu-hoc-tap", "/tin-nhan-phu-huynh", "/tro-choi"].some((path) => pathname.startsWith(path));
  const isActive = (href: string) => pathname === href || (href !== "/tong-quan" && pathname.startsWith(href));
  const { profile } = useHoSo();
  const [toolsOpen, setToolsOpen] = useState(false);
  useEffect(() => { setToolsOpen(false); }, [pathname]);
  const used = profile.luotDaDung;
  const name = profile.hoTen || "Hồ sơ lớp";
  const className = profile.tenLop || "Cập nhật thông tin lớp";
  const mobileNav = [
    { href: "/tong-quan", label: "Tổng quan" },
    { href: profile.capHoc === "tieu-hoc" ? "/phieu-hoc-tap" : "/ke-hoach-tuan", label: profile.capHoc === "tieu-hoc" ? "Phiếu" : "Tuần" },
    { href: profile.capHoc === "tieu-hoc" ? "/ke-hoach-bai-day" : "/giao-an/moi", label: "Soạn bài" },
    { href: "/thu-vien", label: "Thư viện" },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      {/* Thanh bên trên máy tính */}
      <div className="khong-in hidden lg:block border-r border-vien bg-trang">
        <aside className="flex flex-col sticky top-0 h-dvh">
          <div className="px-5 h-16 flex items-center">
            <Link href="/tong-quan">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Điều hướng chính">
            <NavLink href="/tong-quan" label="Tổng quan" active={isActive("/tong-quan")} />
            {[...NHOM].sort((a, b) => Number(b.key === profile.capHoc) - Number(a.key === profile.capHoc)).map((g) => (
              <div key={g.key} className="mt-5">
                <p className="px-3 mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-muc-nhat/80">{g.label}</p>
                {APP_NAV.filter((n) => n.level === g.key && n.href !== "/tong-quan").map((n) => (
                  <NavLink key={n.href} href={n.href} label={n.label} active={isActive(n.href)} />
                ))}
              </div>
            ))}
          </nav>
          <div className="m-3 rounded-the bg-giay border border-vien p-3">
            <div className="mb-3"><ThemeToggle /></div>
            <Link href="/tai-khoan" className="flex items-center gap-3 group">
                <span className="h-9 w-9 rounded-full bg-phan text-muc font-bold grid place-items-center text-sm" aria-hidden="true">
                {name.slice(0, 1).toLocaleUpperCase("vi")}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-muc group-hover:text-bang">{name}</span>
                <span className="block text-[12px] text-muc-nhat truncate">{className}</span>
              </span>
            </Link>
            <div className="mt-3 flex items-baseline justify-between text-[12px] text-muc-nhat">
              <span>Lượt soạn tháng này</span>
              <span className="font-semibold text-muc tabular-nums">
                {used}/{SITE.freeQuota}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-oly overflow-hidden">
              <div className="h-full rounded-full bg-bang" style={{ width: `${Math.max(0, Math.min(100, (used / SITE.freeQuota) * 100))}%` }} />
            </div>
          </div>
        </aside>
      </div>

      {/* Đầu trang trên điện thoại */}
      <div className="khong-in lg:hidden sticky top-0 z-10 h-14 px-4 flex items-center justify-between bg-trang/90 backdrop-blur border-b border-vien">
        <Link href="/tong-quan">
          <Logo />
        </Link>
        <div className="flex items-center gap-2"><span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-phan-nhat text-muc tabular-nums">
          Còn {Math.max(0, SITE.freeQuota - used)} lượt
        </span><ThemeToggle compact /></div>
      </div>

      <main className={`px-4 sm:px-8 py-6 sm:py-10 pb-28 lg:pb-10 max-w-6xl w-full ${authoring ? "vung-soan" : ""}`}>{children}</main>

      {/* Thanh dưới trên điện thoại */}
      <nav
        className="khong-in lg:hidden fixed bottom-0 inset-x-0 z-10 grid grid-cols-5 bg-trang/95 backdrop-blur border-t border-vien pb-[env(safe-area-inset-bottom)]"
        aria-label="Điều hướng nhanh"
      >
        {mobileNav.map((n) => {
          const Icon = TINH_NANG[n.href].icon;
          const on = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={`h-16 flex flex-col items-center justify-center gap-1 text-[11.5px] font-medium ${on ? "text-bang" : "text-muc-nhat"}`}
            >
              <span className={`h-7 w-12 rounded-full grid place-items-center ${on ? "bg-bang-nhat" : ""}`}>
                <Icon size={19} strokeWidth={on ? 2.3 : 1.9} aria-hidden="true" />
              </span>
              {n.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setToolsOpen(true)} aria-haspopup="dialog" aria-expanded={toolsOpen} className="flex h-16 flex-col items-center justify-center gap-1 text-[11.5px] font-medium text-muc-nhat"><span className="grid h-7 w-12 place-items-center"><Grid2X2 size={19} aria-hidden="true" /></span>Công cụ</button>
      </nav>
      {toolsOpen && <Modal title="Công cụ của lớp" onClose={() => setToolsOpen(false)}><nav className="space-y-2 p-4" aria-label="Tất cả công cụ">{APP_NAV.filter((n) => n.href !== "/tong-quan").map((n) => <div key={n.href} onClick={() => setToolsOpen(false)}><NavLink href={n.href} label={n.label} active={isActive(n.href)} /></div>)}<div onClick={() => setToolsOpen(false)}><NavLink href="/tai-khoan" label="Tài khoản và hồ sơ lớp" active={isActive("/tai-khoan")} /></div></nav></Modal>}
    </div>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const { icon: Icon, mau } = TINH_NANG[href];
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-o px-2.5 py-2 text-[14.5px] font-semibold transition-colors ${
        active ? "bg-bang-nhat text-bang" : "text-muc hover:bg-giay"
      }`}
    >
      <span className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${active ? "bg-trang text-bang" : `${mau.nen} ${mau.chu}`}`} aria-hidden="true">
        <Icon size={17} strokeWidth={2} />
      </span>
      {label}
    </Link>
  );
}

import { AppShell } from "@/components/AppShell";

// Account pages read the current user's data at request time, never during a build.
export const dynamic = "force-dynamic";

// Mọi trang sau đăng nhập dùng chung khung này.
// Chưa đăng nhập thì src/middleware.ts chuyển về /dang-nhap (file phải nằm trong src/ thì Next.js mới chạy).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

import { AppShell } from "@/components/AppShell";

// Account pages read the current user's data at request time, never during a build.
export const dynamic = "force-dynamic";

// Mọi trang sau đăng nhập dùng chung khung này.
// TODO: kiểm tra phiên Supabase ở middleware.ts, chưa đăng nhập thì chuyển về /dang-nhap.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { xoaBoNhoHoSo } from "@/lib/use-ho-so";

export function DangXuatButton() {
  const router = useRouter();
  async function signOut() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) await createClient().auth.signOut();
    xoaBoNhoHoSo();
    router.replace("/dang-nhap");
    router.refresh();
  }
  return <Button type="button" variant="phu" className="w-full" onClick={signOut}><LogOut size={17} aria-hidden="true" />Đăng xuất</Button>;
}

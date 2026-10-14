import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = url.searchParams.get("next") ?? "/bat-dau";
  const safeDestination = destination.startsWith("/") && !destination.startsWith("//") && !/[\\\u0000-\u001f]/.test(destination) ? destination : "/bat-dau";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeDestination, url.origin));
  }
  return NextResponse.redirect(new URL("/dang-nhap?error=callback", url.origin));
}

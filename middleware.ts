import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = path === "/" || path === "/dang-nhap" || path === "/dieu-khoan" || path === "/quyen-rieng-tu" || path.startsWith("/auth/");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV === "production" && path.startsWith("/api/")) return NextResponse.json({ error: "Supabase chưa được cấu hình." }, { status: 503 });
    if (process.env.NODE_ENV === "production" && !isPublic) return NextResponse.redirect(new URL("/dang-nhap?error=config", request.url));
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && path.startsWith("/api/")) {
    return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  }
  if (!user && !isPublic) {
    const target = new URL("/dang-nhap", request.url);
    target.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

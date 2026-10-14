import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";

export async function GET() {
  if (demoAllowed()) return NextResponse.json({ profile: null, demo: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const { data, error } = await supabase.from("users").select("ho_ten,cap_hoc,do_tuoi,lop,bo_sach,ten_lop,luot_da_dung").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Chưa tải được hồ sơ lớp." }, { status: 500 });
  return NextResponse.json({ profile: data, email: user.email ?? null });
}

export async function PUT(request: Request) {
  let body: any;
  try { body = await readJsonBounded(request, 16_000); }
  catch (error) { return NextResponse.json({ error: error instanceof PayloadTooLarge ? "Yêu cầu vượt quá dung lượng cho phép." : "Thông tin chưa đúng định dạng JSON." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  if (!body || !["mam-non", "tieu-hoc"].includes(body.capHoc) || typeof body.doTuoi !== "string" || body.doTuoi.length > 80 || typeof body.tenLop !== "string" || body.tenLop.length > 100 || typeof body.boSach !== "string" || body.boSach.length > 80) {
    return NextResponse.json({ error: "Thông tin hồ sơ chưa hợp lệ." }, { status: 400 });
  }
  if (demoAllowed()) return NextResponse.json({ ok: true, demo: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const lop = body.capHoc === "tieu-hoc" ? Number(String(body.doTuoi).match(/[1-5]/)?.[0]) : null;
  const { error } = await supabase.from("users").upsert({
    id: user.id,
    ho_ten: String(body.hoTen ?? user.user_metadata?.full_name ?? "").slice(0, 100),
    cap_hoc: body.capHoc,
    do_tuoi: body.capHoc === "mam-non" ? body.doTuoi : null,
    lop,
    bo_sach: body.capHoc === "tieu-hoc" ? body.boSach : null,
    ten_lop: body.tenLop,
  }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Chưa lưu được hồ sơ lớp." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";
import { boLienKetGiaoAn, saoChepNoiDung } from "@/lib/thu-vien";
import { docKeHoachThang, tieuDeKeHoachThang } from "@/lib/ke-hoach-thang";
import { docPhieu } from "@/lib/mau-phieu";
import { docTroChoi } from "@/lib/tro-choi";

const TYPES = ["giao-an", "khbd", "phieu", "tro-choi", "tin-nhan", "ke-hoach-tuan", "ke-hoach-thang"];
const titleOf = (type: string, data: Record<string, unknown>) => String(data._tieuDe ?? (type === "ke-hoach-thang" ? tieuDeKeHoachThang(docKeHoachThang(data)) : undefined) ?? data.tenHoatDong ?? data.tenBai ?? data.chuDe ?? data.tieuDe ?? (type === "tin-nhan" ? "Tin nhắn phụ huynh" : "Tài liệu mới")).slice(0, 200);

export async function GET(request: Request) {
  if (demoAllowed()) return NextResponse.json({ documents: [], demo: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const url = new URL(request.url);
  let query = supabase.from("documents").select("id,loai,tieu_de,chu_de,noi_dung,cap_nhat").eq("user_id", user.id).order("cap_nhat", { ascending: false }).limit(200);
  const type = url.searchParams.get("loai");
  const id = url.searchParams.get("id");
  const q = url.searchParams.get("q")?.trim().slice(0, 100);
  if (id && /^[0-9a-f-]{36}$/i.test(id)) query = query.eq("id", id);
  if (type && TYPES.includes(type)) query = query.eq("loai", type);
  if (q) query = query.ilike("tieu_de", `%${q.replace(/[%_]/g, "\\$&")}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Chưa tải được thư viện." }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

export async function POST(request: Request) {
  let body: any;
  try { body = await readJsonBounded(request, 1_000_000); }
  catch (error) { return NextResponse.json({ error: error instanceof PayloadTooLarge ? "Tài liệu vượt quá dung lượng cho phép." : "Tài liệu chưa đúng định dạng JSON." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  if (!body || !TYPES.includes(body.loai) || !body.data || typeof body.data !== "object" || Array.isArray(body.data)) return NextResponse.json({ error: "Tài liệu chưa đúng định dạng." }, { status: 400 });
  if (body.loai === "ke-hoach-thang") {
    try { docKeHoachThang(body.data); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Kế hoạch tháng chưa hợp lệ." }, { status: 400 }); }
  }
  try {
    if (body.loai === "phieu") docPhieu(body.data);
    if (body.loai === "tro-choi") docTroChoi(body.data);
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Nội dung chưa hợp lệ." }, { status: 400 }); }
  if (demoAllowed()) return NextResponse.json({ ok: true, demo: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const data = body.data as Record<string, unknown>;
  const id = typeof data.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id) ? data.id : crypto.randomUUID();
  const { data: previous, error: readError } = await supabase.from("documents").select("noi_dung").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (readError) return NextResponse.json({ error: "Chưa đọc được tài liệu để lưu thay đổi." }, { status: 500 });
  if (previous?.noi_dung?._tieuDe) data._tieuDe = previous.noi_dung._tieuDe;
  const payload = { id, user_id: user.id, loai: body.loai, tieu_de: titleOf(body.loai, data), chu_de: typeof data.chuDe === "string" ? data.chuDe.slice(0, 200) : null, noi_dung: { ...data, id }, cap_nhat: new Date().toISOString() };
  const { data: saved, error } = await supabase.from("documents").upsert(payload, { onConflict: "id" }).select("id").single();
  if (error) return NextResponse.json({ error: body.loai === "ke-hoach-thang" && error.code === "23514" ? "Máy chủ chưa được cập nhật để lưu kế hoạch tháng. Cô giữ trang này mở và liên hệ quản trị để cập nhật dữ liệu nhé." : "Chưa lưu được tài liệu." }, { status: 500 });
  return NextResponse.json({ ok: true, id: saved.id });
}

async function mutate(request: Request, remove = false) {
  let body: { id?: string; action?: string; title?: string };
  try { body = await readJsonBounded(request, 4_000) as typeof body; }
  catch (error) { return NextResponse.json({ error: "Yêu cầu chưa đúng định dạng." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  if (!body || typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || (!remove && !["rename", "duplicate"].includes(body.action ?? ""))) return NextResponse.json({ error: "Thao tác chưa hợp lệ." }, { status: 400 });
  if (body.action === "rename" && (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 200)) return NextResponse.json({ error: "Tên tài liệu cần từ 1 đến 200 ký tự." }, { status: 400 });
  if (demoAllowed()) return NextResponse.json({ ok: true, demo: true });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const { data: item, error } = await supabase.from("documents").select("*").eq("id", body.id).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Chưa đọc được tài liệu." }, { status: 500 });
  if (!item) return NextResponse.json({ error: "Tài liệu không còn trong thư viện." }, { status: 404 });
  if (remove) {
    if (item.loai === "giao-an") {
      const { data: plans, error: plansError } = await supabase.from("documents").select("id,noi_dung,cap_nhat").eq("user_id", user.id).in("loai", ["ke-hoach-tuan", "ke-hoach-thang"]);
      if (plansError) return NextResponse.json({ error: "Chưa cập nhật được kế hoạch liên quan. Tài liệu chưa bị xóa." }, { status: 500 });
      for (const plan of plans ?? []) {
        const content = plan.noi_dung as Record<string, unknown>;
        let next: Record<string, unknown>;
        try { next = boLienKetGiaoAn(content, body.id); }
        catch { return NextResponse.json({ error: "Có kế hoạch liên quan chưa đọc được. Tài liệu chưa bị xóa." }, { status: 409 }); }
        if (next !== content) {
          const { data: savedPlan, error: updateError } = await supabase.from("documents").update({ noi_dung: next, cap_nhat: new Date().toISOString() }).eq("id", plan.id).eq("user_id", user.id).eq("cap_nhat", plan.cap_nhat).select("id").maybeSingle();
          if (updateError || !savedPlan) return NextResponse.json({ error: "Kế hoạch liên quan vừa thay đổi. Cô thử xóa lại nhé." }, { status: 409 });
        }
      }
    }
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", body.id).eq("user_id", user.id);
    if (deleteError) return NextResponse.json({ error: "Chưa xóa được tài liệu." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const now = new Date().toISOString();
  const title = body.action === "rename" ? body.title!.trim() : `${String(item.tieu_de).slice(0, 188)} (bản sao)`;
  let content: Record<string, unknown>;
  try { content = body.action === "duplicate" ? saoChepNoiDung(item.noi_dung, title) : { ...item.noi_dung, _tieuDe: title }; }
  catch { return NextResponse.json({ error: "Chưa đọc được cấu trúc tài liệu để nhân bản. Cô giữ lại bản gốc nhé." }, { status: 400 }); }
  const payload = { user_id: user.id, loai: item.loai, tieu_de: title, chu_de: item.chu_de, noi_dung: content, cap_nhat: now };
  const query = body.action === "duplicate" ? supabase.from("documents").insert({ ...payload, id: content.id }) : supabase.from("documents").update(payload).eq("id", item.id).eq("user_id", user.id).eq("cap_nhat", item.cap_nhat);
  const { data: saved, error: writeError } = await query.select("id,loai,tieu_de,chu_de,noi_dung,cap_nhat").maybeSingle();
  if (writeError || !saved) return NextResponse.json({ error: "Chưa lưu được thay đổi. Cô tải lại danh sách rồi thử lại." }, { status: 409 });
  return NextResponse.json({ ok: true, document: saved });
}

export async function PATCH(request: Request) { return mutate(request); }
export async function DELETE(request: Request) { return mutate(request, true); }

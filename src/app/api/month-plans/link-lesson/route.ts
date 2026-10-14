import { NextResponse } from "next/server";
import { cacONoiDung, docKeHoachThang, ganGiaoAnThang, kiemTraGanTuDong } from "@/lib/ke-hoach-thang";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";

export async function POST(request: Request) {
  let body: { planId?: string; nhomId?: string; lessonId?: string | null; expectedId?: string | null; tuDong?: boolean };
  try { body = await readJsonBounded(request, 3000) as typeof body; }
  catch (e) { return NextResponse.json({ error: "Yêu cầu liên kết chưa hợp lệ." }, { status: e instanceof PayloadTooLarge ? 413 : 400 }); }
  const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  if (!body || !uuid(body.planId) || !uuid(body.nhomId) || !(body.lessonId === null || uuid(body.lessonId)) || !(body.expectedId === null || uuid(body.expectedId)) || (body.tuDong !== undefined && typeof body.tuDong !== "boolean")) return NextResponse.json({ error: "ID liên kết chưa hợp lệ." }, { status: 400 });
  if (demoAllowed()) return NextResponse.json({ ok: true, demo: true });
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
  const { data: row, error } = await db.from("documents").select("noi_dung,cap_nhat").eq("id", body.planId).eq("user_id", user.id).eq("loai", "ke-hoach-thang").maybeSingle();
  if (error || !row) return NextResponse.json({ error: "Chưa đọc được kế hoạch tháng của cô." }, { status: error ? 500 : 404 });
  try {
    const plan = docKeHoachThang(row.noi_dung);
    if (body.lessonId) {
      const { data: lesson, error: lessonError } = await db.from("documents").select("noi_dung").eq("id", body.lessonId).eq("user_id", user.id).eq("loai", "giao-an").maybeSingle();
      if (lessonError || !lesson) return NextResponse.json({ error: "Không đọc được giáo án của cô để liên kết." }, { status: lessonError ? 500 : 404 });
      if (lesson.noi_dung?.doTuoi !== plan.doTuoi) return NextResponse.json({ error: "Giáo án không cùng độ tuổi với kế hoạch." }, { status: 400 });
      if (body.tuDong) kiemTraGanTuDong(plan, body.nhomId, { id: body.lessonId, nguCanhKeHoach: lesson.noi_dung?.nguCanhKeHoach });
    }
    const next = ganGiaoAnThang(plan, body.nhomId, body.lessonId, body.expectedId);
    if (next !== plan) {
      const { data: saved, error: writeError } = await db.from("documents").update({ noi_dung: next, cap_nhat: new Date().toISOString() }).eq("id", body.planId).eq("user_id", user.id).eq("cap_nhat", row.cap_nhat).select("id").maybeSingle();
      if (writeError || !saved) {
        const { data: latest } = await db.from("documents").select("noi_dung").eq("id", body.planId).eq("user_id", user.id).eq("loai", "ke-hoach-thang").maybeSingle();
        if (latest) {
          const current = docKeHoachThang(latest.noi_dung);
          const cell = cacONoiDung(current).find((o) => o.nhom.id === body.nhomId);
          if (cell && (cell.nhom.giaoAnId ?? null) === body.lessonId) return NextResponse.json({ ok: true, keHoach: current });
        }
        return NextResponse.json({ error: "Kế hoạch vừa thay đổi. Cô mở lại kế hoạch rồi gắn giáo án nhé." }, { status: 409 });
      }
    }
    return NextResponse.json({ ok: true, keHoach: next });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Chưa gắn được giáo án." }, { status: 409 }); }
}

import { NextResponse } from "next/server";
import { AiError, docCauHinh, type AiCauHinh } from "@/lib/ai";
import { ChuaHoTro, DauVaoSai, taoBangAi } from "@/lib/generate-ai";
import { taoBanMau } from "@/lib/generate-mock";
import { lamSachDauVao, type LoaiSinh } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";
import { demoAllowed } from "@/lib/supabase/configured";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";
import { docKeHoachThang, layNguCanhGiaoAn } from "@/lib/ke-hoach-thang";
import { docNguCanhDemo, kiemTraDoDaiNguCanh } from "@/lib/ngu-canh-giao-an";
import { DO_TUOI_LABEL, type NguCanhGiaoAnThang } from "@/lib/types";
import { docYeuCauHocLieu } from "@/lib/yeu-cau-hoc-lieu";

export const runtime = "nodejs";
export const maxDuration = 120; // một lượt có thể thử tối đa 4 lần gọi AI

const LOAI_HOP_LE: LoaiSinh[] = ["ke-hoach-tuan", "giao-an", "khbd", "phieu", "tro-choi", "tin-nhan"];

// Chặn bấm liên tục làm cạn hạn mức miễn phí của khóa AI. Bộ đếm nằm trong bộ nhớ một máy chủ;
// khi chạy nhiều máy chủ hoặc có đăng nhập thì chuyển sang đếm theo người dùng trong cơ sở dữ liệu.
const TOI_DA = 10;
const CUA_SO_MS = 60_000;
const lanGoi = new Map<string, number[]>();

function vuotGioiHan(ip: string): boolean {
  const now = Date.now();
  const gan = (lanGoi.get(ip) ?? []).filter((t) => now - t < CUA_SO_MS);
  if (gan.length >= TOI_DA) {
    lanGoi.set(ip, gan);
    return true;
  }
  gan.push(now);
  lanGoi.set(ip, gan);
  if (lanGoi.size > 5000) lanGoi.clear(); // tránh phình bộ nhớ
  return false;
}

// POST /api/generate  { loai, input }  →  { data, nguon }
// nguon: "ai" khi gọi mô hình, "mau" ở chế độ demo phát triển.
export async function POST(req: Request) {
  let parsed: unknown;
  try { parsed = await readJsonBounded(req, 128_000); }
  catch (error) { return NextResponse.json({ error: error instanceof PayloadTooLarge ? "Yêu cầu vượt quá dung lượng cho phép." : "Yêu cầu chưa đúng định dạng JSON." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  const body = parsed as { loai?: string; input?: Record<string, unknown> } | null;
  const loai = body?.loai as LoaiSinh | undefined;
  if (!loai || !LOAI_HOP_LE.includes(loai)) {
    return NextResponse.json({ error: "Thiếu loại nội dung cần soạn." }, { status: 400 });
  }
  const input = body?.input && typeof body.input === "object" ? body.input : {};
  if (Object.entries(input).some(([key, v]) => typeof v === "string" && v.length > (loai === "giao-an" && key === "nguCanhDemo" ? 20_000 : 2_000))) {
    return NextResponse.json({ error: "Một trường nội dung quá dài. Cô rút gọn rồi thử lại nhé." }, { status: 400 });
  }

  let context: NguCanhGiaoAnThang | undefined;
  if (loai === "phieu" || loai === "tro-choi") {
    try { docYeuCauHocLieu(loai, lamSachDauVao(loai, input)); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Yêu cầu học liệu chưa hợp lệ." }, { status: 400 }); }
  }
  if (loai === "giao-an" && (input.keHoachThangId || input.nhomId)) {
    try {
      if (typeof input.keHoachThangId !== "string" || typeof input.nhomId !== "string" || !/^[0-9a-f-]{36}$/i.test(input.keHoachThangId) || !/^[0-9a-f-]{36}$/i.test(input.nhomId)) throw new Error("Thiếu liên kết ô kế hoạch tháng.");
      if (demoAllowed()) {
        context = docNguCanhDemo(JSON.parse(String(input.nguCanhDemo ?? "null")));
        if (context.keHoachId !== input.keHoachThangId || context.nhomId !== input.nhomId) throw new Error("Ngữ cảnh demo không khớp ô kế hoạch.");
      } else {
        const db = await createClient();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
        const { data: row, error } = await db.from("documents").select("noi_dung").eq("id", input.keHoachThangId).eq("user_id", user.id).eq("loai", "ke-hoach-thang").maybeSingle();
        if (error || !row) throw new Error("Chưa đọc được kế hoạch tháng của cô. Cô mở lại kế hoạch nhé.");
        context = layNguCanhGiaoAn(docKeHoachThang(row.noi_dung), input.nhomId);
      }
      kiemTraDoDaiNguCanh(context);
      if (input.doTuoi !== context.doTuoi && input.doTuoi !== DO_TUOI_LABEL[context.doTuoi]) throw new Error("Độ tuổi phải khớp với kế hoạch tháng.");
    } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Chưa đọc được ngữ cảnh kế hoạch." }, { status: 400 }); }
  }

  let cfg: AiCauHinh | null;
  try {
    cfg = docCauHinh();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Cấu hình AI chưa đúng." }, { status: 503 });
  }

  // Chế độ demo chỉ dùng trên máy phát triển, có thông báo rõ từ giao diện.
  if (!cfg) {
    if (loai === "phieu" || loai === "tro-choi") return NextResponse.json({ error: "Dịch vụ AI chưa được cấu hình. Cô có thể dùng mẫu có sẵn hoặc nhờ quản trị bật tính năng tạo bằng AI." }, { status: 503 });
    if (!demoAllowed()) return NextResponse.json({ error: "Máy chủ chưa cấu hình dịch vụ AI." }, { status: 503 });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (vuotGioiHan(ip)) return NextResponse.json({ error: "Cô bấm hơi nhanh. Đợi một phút rồi soạn tiếp nhé." }, { status: 429 });
    await new Promise((r) => setTimeout(r, 900));
    const data = taoBanMau(loai, lamSachDauVao(loai, input), context);
    if (data == null) return NextResponse.json({ error: "Loại nội dung này chưa được hỗ trợ trong bản dựng." }, { status: 501 });
    return NextResponse.json({ data, nguon: "mau" });
  }

  if (demoAllowed()) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
    if (vuotGioiHan(ip)) return NextResponse.json({ error: "Cô bấm hơi nhanh. Đợi một phút rồi soạn tiếp nhé." }, { status: 429 });
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Cô đăng nhập để tiếp tục." }, { status: 401 });
    const limit = Math.max(1, Number(process.env.FREE_GENERATIONS_PER_MONTH || process.env.NEXT_PUBLIC_FREE_GENERATIONS_PER_MONTH) || 20);
    const { data: allowed, error: quotaError } = await supabase.rpc("dung_luot_soan", { p_limit: limit });
    if (quotaError) {
      console.error("[quota] cannot consume generation", quotaError.code);
      return NextResponse.json({ error: "Chưa kiểm tra được lượt soạn. Cô thử lại sau nhé." }, { status: 503 });
    }
    if (!allowed) return NextResponse.json({ error: "Cô đã dùng hết lượt soạn miễn phí tháng này." }, { status: 429 });
  }

  // Lượt đã bị trừ ở trên; AI lỗi thì trả lại để cô không mất lượt oan. Chưa có hàm SQL thì bỏ qua, không làm hỏng phản hồi.
  const hoanLuot = async () => {
    if (demoAllowed()) return;
    try { const supabase = await createClient(); await supabase.rpc("hoan_luot_soan"); } catch { /* bỏ qua */ }
  };
  try {
    const { data, ket } = await taoBangAi(cfg, loai, input, context);
    // Chỉ ghi số liệu vận hành, không ghi nội dung người dùng và không ghi khóa.
    console.info(`[ai] ${loai} ${ket.mohinh} ${ket.ms}ms vao=${ket.tokenVao ?? "?"} ra=${ket.tokenRa ?? "?"}`);
    return NextResponse.json({ data, nguon: "ai" });
  } catch (e) {
    await hoanLuot();
    if (e instanceof DauVaoSai) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof ChuaHoTro) return NextResponse.json({ error: "Loại nội dung này chưa được hỗ trợ trong bản dựng." }, { status: 501 });
    if (e instanceof AiError) {
      console.warn(`[ai] ${loai} lỗi ${e.kind}: ${e.message}`);
      const TRA: Record<AiError["kind"], [number, string]> = {
        "chua-cau-hinh": [503, "AI chưa được cấu hình đúng. Cô báo người quản trị giúp."],
        "khoa-sai": [503, "Khóa AI không hợp lệ hoặc đã bị thu hồi. Cô báo người quản trị giúp."],
        "het-han-muc": [429, "AI đã hết lượt miễn phí tạm thời. Cô thử lại sau ít phút nhé."],
        "qua-tai": [503, "AI đang quá tải. Cô thử lại sau ít phút nhé."],
        "het-gio": [504, "AI trả lời quá lâu. Cô thử lại nhé."],
        "bi-chan": [422, "AI không soạn được với nội dung này. Cô thử đổi cách diễn đạt nhé."],
        "sai-khuon": [502, "AI soạn chưa đúng mẫu. Cô bấm Soạn lại một lần nữa nhé."],
        khac: [502, "Không soạn được lúc này. Cô thử lại sau ít phút nhé."],
      };
      const [status, error] = TRA[e.kind];
      return NextResponse.json({ error }, { status });
    }
    console.error("[ai] lỗi không xác định", e instanceof Error ? e.name : typeof e);
    return NextResponse.json({ error: "Không soạn được lúc này. Cô thử lại sau ít phút nhé." }, { status: 500 });
  }
}

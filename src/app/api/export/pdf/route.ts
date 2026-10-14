import { NextResponse } from "next/server";
import { KhongCoChrome, PDF_HTML, xuatPdf, type LoaiPdf } from "@/lib/export-pdf";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";
import { docKeHoachThang } from "@/lib/ke-hoach-thang";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/export/pdf  { loai, data } → PDF; kế hoạch tháng chọn Letter/A4 ngang.
// Nội dung chỉ nhận từ phiên đăng nhập hợp lệ; kiểm tra kích thước trước khi mở Chrome.
export async function POST(req: Request) {
  let body: { loai?: string; data?: unknown } | null;
  try { body = await readJsonBounded(req, 1_000_000) as typeof body; }
  catch (error) { return NextResponse.json({ error: error instanceof PayloadTooLarge ? "Tài liệu vượt quá dung lượng cho phép." : "Yêu cầu chưa đúng định dạng JSON." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  const loai = body?.loai as LoaiPdf | undefined;
  if (!loai || !Object.hasOwn(PDF_HTML, loai) || !body?.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json({ error: "Thiếu nội dung cần xuất ra PDF." }, { status: 400 });
  }
  if (loai === "ke-hoach-thang") {
    try { docKeHoachThang(body.data); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Kế hoạch tháng chưa hợp lệ." }, { status: 422 }); }
  }
  try {
    const pdf = await xuatPdf(loai, body.data);
    return new NextResponse(new Uint8Array(pdf), {
      headers: { "Content-Type": "application/pdf", "Cache-Control": "no-store" },
    });
  } catch (e) {
    if (e instanceof KhongCoChrome) {
      return NextResponse.json(
        { error: "Máy chủ chưa có trình duyệt Chrome để tạo PDF. Cô nhờ người quản trị cài Chrome hoặc đặt CHROME_PATH." },
        { status: 501 },
      );
    }
    // Dữ liệu sai khuôn làm hàm dựng HTML ném TypeError; lỗi còn lại là do Chrome.
    if (e instanceof TypeError) {
      return NextResponse.json({ error: "Nội dung không đúng khuôn nên chưa xuất được PDF." }, { status: 422 });
    }
    return NextResponse.json({ error: "Không tạo được PDF. Thử lại sau ít phút." }, { status: 500 });
  }
}

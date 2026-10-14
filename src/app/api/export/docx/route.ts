import { NextResponse } from "next/server";
import { XUAT_DOCX, type LoaiXuat } from "@/lib/export-docx";
import { PayloadTooLarge, readJsonBounded } from "@/lib/read-json";
import { docKeHoachThang } from "@/lib/ke-hoach-thang";

export const runtime = "nodejs";

// POST /api/export/docx  { loai, data }  →  file .docx
// Nội dung chỉ nhận từ phiên đăng nhập hợp lệ; kiểm tra kích thước trước khi tạo file.
export async function POST(req: Request) {
  let body: { loai?: string; data?: unknown } | null;
  try { body = await readJsonBounded(req, 1_000_000) as typeof body; }
  catch (error) { return NextResponse.json({ error: error instanceof PayloadTooLarge ? "Tài liệu vượt quá dung lượng cho phép." : "Yêu cầu chưa đúng định dạng JSON." }, { status: error instanceof PayloadTooLarge ? 413 : 400 }); }
  const loai = body?.loai as LoaiXuat | undefined;
  if (!loai || !Object.hasOwn(XUAT_DOCX, loai) || !body?.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return NextResponse.json({ error: "Thiếu nội dung cần xuất ra Word." }, { status: 400 });
  }
  if (loai === "ke-hoach-thang") {
    try { docKeHoachThang(body.data); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Kế hoạch tháng chưa hợp lệ." }, { status: 422 }); }
  }
  try {
    // Mỗi hàm xuất nhận đúng khuôn của loại tương ứng; dữ liệu sai khuôn sẽ ném lỗi và trả 422 bên dưới.
    const buffer = await (XUAT_DOCX[loai] as (d: unknown) => Promise<Buffer>)(body.data);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Nội dung không đúng khuôn nên chưa xuất được file Word." }, { status: 422 });
  }
}

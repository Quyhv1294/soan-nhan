import { docTaiLieu, lienKetGiaoAnLocal } from "./kho-local";
import { docKeHoachThang } from "./ke-hoach-thang";
import { demoAllowed } from "./supabase/configured";

export async function taiKeHoachThang(id: string, signal?: AbortSignal) {
  let content: unknown;
  if (demoAllowed()) content = docTaiLieu().find((d) => d.id === id && d.loai === "ke-hoach-thang")?.noiDung;
  else {
    const response = await fetch(`/api/documents?loai=ke-hoach-thang&id=${encodeURIComponent(id)}`, { signal });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Chưa đọc được kế hoạch tháng.");
    content = result.documents?.find((d: { id: string; loai: string }) => d.id === id && d.loai === "ke-hoach-thang")?.noi_dung;
  }
  if (!content) throw new Error("Kế hoạch tháng không còn trong thư viện này.");
  return docKeHoachThang(content);
}
export async function lienKetGiaoAnThang(planId: string, nhomId: string, lessonId: string | null, expectedId: string | null, tuDong = false) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch("/api/month-plans/link-lesson", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId, nhomId, lessonId, expectedId, tuDong }), signal: controller.signal });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error(result?.error ?? "Chưa lưu được liên kết giáo án.");
    return result.demo ? lienKetGiaoAnLocal(planId, nhomId, lessonId, expectedId, tuDong) : docKeHoachThang(result.keHoach);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw new Error("Chưa nhận được kết quả gắn giáo án. Cô thử gắn lại để kiểm tra và hoàn tất nhé.");
    throw e;
  } finally { clearTimeout(timer); }
}
export const hrefOThang = (planId: string, nhomId: string) => `/ke-hoach-thang?${new URLSearchParams({ id: planId, nhom: nhomId })}`;
export const hrefSoanTuThang = (planId: string, nhomId: string) => `/giao-an/moi?${new URLSearchParams({ keHoachThang: planId, nhom: nhomId })}`;

import { renderPhieuSvg } from "@/lib/phieu";
import type { PhieuHocTap } from "@/lib/types";

export function PhieuPreview({ phieu }: { phieu: PhieuHocTap }) {
  // The renderer escapes all user text and only emits our own SVG shapes.
  return <figure className="phieu-preview overflow-hidden rounded-md border border-vien bg-trang shadow-noi" aria-label="Bản xem trước phiếu học tập" dangerouslySetInnerHTML={{ __html: renderPhieuSvg(phieu) }} />;
}

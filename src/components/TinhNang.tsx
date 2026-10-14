import {
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  Footprints,
  Gamepad2,
  HeartHandshake,
  LayoutDashboard,
  Library,
  Lightbulb,
  MessageCircleHeart,
  MessagesSquare,
  NotebookPen,
  Palette,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { LinhVuc, LoaiTaiLieu } from "@/lib/types";

// Màu của một tính năng / lĩnh vực. Viết đủ tên lớp để Tailwind nhận ra khi quét mã.
export type Mau = { chu: string; nen: string; vien: string };

const MAU = {
  bang: { chu: "text-bang", nen: "bg-bang-nhat", vien: "border-bang/30" },
  xanh: { chu: "text-xanh", nen: "bg-xanh-nhat", vien: "border-xanh/30" },
  cam: { chu: "text-cam", nen: "bg-cam-nhat", vien: "border-cam/30" },
  tim: { chu: "text-tim", nen: "bg-tim-nhat", vien: "border-tim/30" },
  hong: { chu: "text-hong", nen: "bg-hong-nhat", vien: "border-hong/30" },
  la: { chu: "text-la", nen: "bg-la-nhat", vien: "border-la/30" },
  nghe: { chu: "text-nghe", nen: "bg-nghe-nhat", vien: "border-nghe/30" },
  muc: { chu: "text-muc-nhat", nen: "bg-vien/70", vien: "border-vien" },
} satisfies Record<string, Mau>;

export type TinhNang = { icon: LucideIcon; mau: Mau; moTa: string };

// Theo đường dẫn trang — dùng cho menu, thẻ công cụ, trang chủ.
export const TINH_NANG: Record<string, TinhNang> = {
  "/tong-quan": { icon: LayoutDashboard, mau: MAU.muc, moTa: "Việc của tuần này" },
  "/ke-hoach-tuan": { icon: CalendarDays, mau: MAU.bang, moTa: "Một chủ đề thành khung 5 ngày, đủ 5 buổi, trải đều 5 lĩnh vực." },
  "/ke-hoach-thang": { icon: CalendarDays, mau: MAU.bang, moTa: "Bảy nhóm hoạt động, nội dung chung theo tháng, tuần và ngày học cụ thể." },
  "/giao-an/moi": { icon: NotebookPen, mau: MAU.xanh, moTa: "Giáo án mầm non bảng 3 cột: thời gian, hoạt động của cô, của trẻ." },
  "/ke-hoach-bai-day": { icon: BookOpenCheck, mau: MAU.tim, moTa: "Kế hoạch bài dạy tiểu học theo Công văn 2345, Toán và Tiếng Việt." },
  "/phieu-hoc-tap": { icon: ClipboardList, mau: MAU.cam, moTa: "AI tạo bài tập mới theo chủ đề; 12 dạng phiếu chữ cái, toán và quan sát, in A4." },
  "/tro-choi": { icon: Gamepad2, mau: MAU.hong, moTa: "AI tạo câu hỏi, thẻ và nhiệm vụ mới cho 7 kiểu trò chơi trình chiếu." },
  "/tin-nhan-phu-huynh": { icon: MessageCircleHeart, mau: MAU.la, moTa: "Tin nhắn tuần gửi nhóm Zalo phụ huynh, sao chép một chạm." },
  "/thu-vien": { icon: Library, mau: MAU.nghe, moTa: "Mọi bài đã soạn, tìm lại theo tên, chủ đề, loại." },
  "/tai-khoan": { icon: UserRound, mau: MAU.muc, moTa: "Hồ sơ lớp, lượt soạn" },
};

export const LOAI_TINH_NANG: Record<LoaiTaiLieu, TinhNang> = {
  "giao-an": TINH_NANG["/giao-an/moi"],
  khbd: TINH_NANG["/ke-hoach-bai-day"],
  phieu: TINH_NANG["/phieu-hoc-tap"],
  "tro-choi": TINH_NANG["/tro-choi"],
  "tin-nhan": TINH_NANG["/tin-nhan-phu-huynh"],
  "ke-hoach-tuan": TINH_NANG["/ke-hoach-tuan"],
  "ke-hoach-thang": TINH_NANG["/ke-hoach-thang"],
};

export const LINH_VUC_MAU: Record<LinhVuc, { icon: LucideIcon; mau: Mau; ngan: string }> = {
  "Phát triển thể chất": { icon: Footprints, mau: MAU.cam, ngan: "Thể chất" },
  "Phát triển nhận thức": { icon: Lightbulb, mau: MAU.xanh, ngan: "Nhận thức" },
  "Phát triển ngôn ngữ": { icon: MessagesSquare, mau: MAU.tim, ngan: "Ngôn ngữ" },
  "Phát triển tình cảm, kỹ năng xã hội": { icon: HeartHandshake, mau: MAU.hong, ngan: "Tình cảm – XH" },
  "Phát triển thẩm mỹ": { icon: Palette, mau: MAU.la, ngan: "Thẩm mỹ" },
};

// Ô vuông bo góc chứa biểu tượng, tô màu theo tính năng.
export function OBieuTuong({ icon: Icon, mau, size = "md" }: { icon: LucideIcon; mau: Mau; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-8 w-8 rounded-lg", md: "h-10 w-10 rounded-xl", lg: "h-12 w-12 rounded-xl" }[size];
  const i = { sm: 16, md: 20, lg: 24 }[size];
  return (
    <span className={`${s} ${mau.nen} ${mau.chu} grid place-items-center shrink-0`} aria-hidden="true">
      <Icon size={i} strokeWidth={2} />
    </span>
  );
}

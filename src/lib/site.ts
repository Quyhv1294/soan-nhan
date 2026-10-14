// Tên sản phẩm đặt ở một chỗ để đổi dễ dàng khi chốt thương hiệu.
export const SITE = {
  name: "Soạn Nhàn",
  tagline: "Chọn chủ đề tuần, nhận giáo án, phiếu học tập và trò chơi để dùng ngay.",
  freeQuota: Math.max(1, Number(process.env.NEXT_PUBLIC_FREE_GENERATIONS_PER_MONTH) || 20),
};

export type NavItem = {
  href: string;
  label: string;
  hint: string;
  level: "mam-non" | "tieu-hoc" | "chung";
  feature: string;
};

// Điều hướng theo luồng làm việc, không theo danh mục dài như các trang kho tài liệu.
export const APP_NAV: NavItem[] = [
  { href: "/tong-quan", label: "Tổng quan", hint: "Việc của tuần này", level: "chung", feature: "" },
  { href: "/ke-hoach-thang", label: "Kế hoạch tháng", hint: "Nội dung theo tháng, tuần, ngày", level: "mam-non", feature: "" },
  { href: "/ke-hoach-tuan", label: "Kế hoạch tuần", hint: "Khung 5 ngày theo chủ đề", level: "mam-non", feature: "F2" },
  { href: "/giao-an/moi", label: "Giáo án mầm non", hint: "Mẫu 3 cột", level: "mam-non", feature: "F3" },
  { href: "/ke-hoach-bai-day", label: "Kế hoạch bài dạy", hint: "Tiểu học, mẫu CV 2345", level: "tieu-hoc", feature: "F4" },
  { href: "/phieu-hoc-tap", label: "Phiếu học tập", hint: "In khổ A4", level: "chung", feature: "F5" },
  { href: "/tro-choi", label: "Trò chơi lớp học", hint: "Trình chiếu", level: "chung", feature: "F6" },
  { href: "/tin-nhan-phu-huynh", label: "Tin nhắn phụ huynh", hint: "Gửi nhóm Zalo", level: "chung", feature: "F7" },
  { href: "/thu-vien", label: "Thư viện của tôi", hint: "Mọi bài đã soạn", level: "chung", feature: "F8" },
];

// Thanh dưới trên điện thoại: tối đa 5 mục quan trọng nhất.
export const MOBILE_NAV = [
  { href: "/tong-quan", label: "Tổng quan" },
  { href: "/ke-hoach-tuan", label: "Tuần" },
  { href: "/giao-an/moi", label: "Soạn bài" },
  { href: "/thu-vien", label: "Thư viện" },
  { href: "/tai-khoan", label: "Tài khoản" },
];

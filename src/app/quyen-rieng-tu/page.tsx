import type { Metadata } from "next";
import { TrangPhapLy } from "@/components/TrangPhapLy";

export const metadata: Metadata = { title: "Chính sách quyền riêng tư" };

// Nội dung cần được rà soát pháp lý và cập nhật theo cấu hình triển khai trước khi phát hành.
export default function QuyenRiengTu() {
  return (
    <TrangPhapLy title="Chính sách quyền riêng tư">
      <p>Tài khoản dùng email do nhà cung cấp đăng nhập xác thực. Hồ sơ lớp gồm cấp học, độ tuổi hoặc lớp, bộ sách và tên lớp nếu cô nhập. Tài liệu chỉ được lưu vào tài khoản sau khi soạn thành công.</p>
      <p>Khi cô yêu cầu tạo nội dung, thông tin trong biểu mẫu được gửi tới nhà cung cấp mô hình AI đã cấu hình để tạo bản nháp. Không nhập tên đầy đủ, hình ảnh, sức khỏe hoặc thông tin nhận dạng của trẻ và gia đình vào biểu mẫu hay nội dung gửi AI.</p>
      <p>Trong bản demo chạy trên máy phát triển, kế hoạch và tài liệu được giữ trong bộ nhớ trình duyệt. Khi dùng dịch vụ đã cấu hình, dữ liệu tài khoản được lưu trong cơ sở dữ liệu Supabase theo chính sách bảo mật của dự án.</p>
      <p>Đây là mô tả cách app hiện hoạt động, chưa thay thế chính sách quyền riêng tư chính thức. Chủ sản phẩm cần xác nhận nhà cung cấp, thời hạn lưu, quy trình xóa dữ liệu và đầu mối liên hệ trước khi mở dịch vụ cho người dùng.</p>
    </TrangPhapLy>
  );
}

import type { Metadata } from "next";
import { TrangPhapLy } from "@/components/TrangPhapLy";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

// Bản điều khoản cần được rà soát pháp lý trước khi phát hành.
export default function DieuKhoan() {
  return (
    <TrangPhapLy title="Điều khoản sử dụng">
      <p>Nội dung AI tạo là bản nháp để tham khảo. Giáo viên cần kiểm tra tính chính xác, độ phù hợp với học sinh, chương trình và yêu cầu của nhà trường trước khi sử dụng.</p>
      <p>Cô chịu trách nhiệm bảo vệ thông tin đăng nhập và chỉ gửi nội dung cần thiết để tạo tài liệu. Không gửi thông tin nhận dạng của trẻ hoặc gia đình.</p>
      <p>Điều khoản chính thức cần nêu rõ phạm vi dịch vụ, giới hạn sử dụng, cách xử lý dữ liệu, hỗ trợ và cách chấm dứt tài khoản trước khi mở dịch vụ.</p>
    </TrangPhapLy>
  );
}

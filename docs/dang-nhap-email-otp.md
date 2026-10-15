# Đăng nhập bằng mã OTP email

## Luồng trên website

1. Nhập email và bấm **Gửi mã OTP**.
2. App gọi `signInWithOtp({ email, options: { shouldCreateUser: true } })`; chỉ chuyển sang nhập mã khi API chấp nhận yêu cầu.
3. Nhập hoặc dán mã vào ô **Mã OTP**. Mã là chuỗi chữ số để giữ nguyên số 0 ở đầu; ô nhận 6–10 chữ số, phù hợp khi dự án thay độ dài mã. Supabase quyết định mã hợp lệ và hạn sử dụng.
4. Bấm **Xác nhận và đăng nhập**. App gọi `verifyOtp({ email: sentEmail, token, type: "email" })`. Chỉ điều hướng khi trả về cả user và session.
5. Mở trang theo `next` nội bộ nếu có, mặc định `/tong-quan`. Tải trang mới để đọc cookie phiên và dữ liệu tài khoản. Hồ sơ lớp có thể chỉnh trong Tài khoản.

Có nút đổi địa chỉ email, yêu cầu lại mã sau 60 giây và hiển thị lỗi gửi/xác minh. Thời gian chờ trên giao diện hỗ trợ thao tác; giới hạn gửi và xác minh thật do Supabase thực thi. Đổi sang email khác vẫn có thể gặp giới hạn gửi chung của nhà cung cấp.

OTP được lưu tạm trong state của form, không ghi vào localStorage, URL, kho tài liệu hay log. Không tự tạo mã hoặc tự xác nhận mã trong frontend.

## Bắt buộc cấu hình mẫu email trong Supabase

`signInWithOtp` dùng chung API cho mã OTP và magic link. **Nội dung email template quyết định người dùng thấy mã hay đường dẫn**. Push code hoặc redeploy Vercel không thay template của Supabase hosted.

Trong đúng dự án Supabase:

1. **Authentication → Sign In / Providers → Email**: bật Email provider. Bật đăng ký người dùng mới nếu muốn cho khách mới tự sử dụng.
2. **Authentication → Email Templates** (ở một số giao diện là **Authentication → Emails → Templates**), mở **Magic Link / OTP**.
3. Đặt Subject: **Mã đăng nhập Soạn Nhàn**.
4. Sao chép toàn bộ file [`supabase/templates/email-otp.html`](../supabase/templates/email-otp.html) vào Body rồi bấm Save. Đoạn hiển thị mã là `{{ .Token }}`; mẫu không có nút mở đường dẫn xác nhận.
5. Áp dụng cùng mẫu/subject cho **Confirm signup** để email tạo tài khoản lần đầu cũng hiển thị mã. Không thay mẫu đổi email hoặc khôi phục mật khẩu bằng mẫu này.
6. Giữ thời gian hết hạn OTP ở cấu hình Email phù hợp với dự án. Lời hướng dẫn trên app không giả định mã còn hiệu lực trong một số phút cố định.
7. Cấu hình Custom SMTP để gửi cho người dùng bên ngoài nhóm Supabase. Giữ cơ chế xác minh email của Supabase.

Mẫu chỉ dùng `{{ .Token }}`, không cần thêm biến Google hay sửa cơ sở dữ liệu. Biến kết nối Supabase và khóa phía client trên Vercel vẫn áp dụng như các trang tài khoản hiện có.

## Tình trạng triển khai và kiểm tra

- Đã kiểm tra biên dịch TypeScript sau khi thay đổi form.
- Chưa gửi email OTP thật hoặc chạy kiểm tra trình duyệt trong lần thay đổi này.
- Chưa có kết nối quản trị Supabase trong phiên làm việc để cập nhật email template trên cloud; mẫu sẵn có trong kho để chủ dự án áp dụng.
- Không cần migration SQL. Route callback cũ vẫn xử lý các email chứa đường dẫn đã phát hành trước đây; luồng OTP mới xác minh ngay trong form.

## Tài liệu chính thức

- [Supabase Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Xác minh OTP](https://supabase.com/docs/reference/javascript/auth-verifyotp)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)

# Đưa Soạn Nhàn lên GitHub và Vercel

## Cấu hình được chọn

- Kho mã: `https://github.com/Quyhv1294/soan-nhan`.
- Hosting: Vercel, địa chỉ miễn phí dạng `<ten-du-an>.vercel.app`; tên chính xác tùy tên còn trống khi tạo dự án.
- Khách đăng nhập Supabase để dùng AI thật và lưu tài liệu riêng theo tài khoản. Production yêu cầu Supabase, không bật demo bỏ qua đăng nhập.
- Node.js 24, `npm ci`, `npm run build`; Next.js được cố định ở phiên bản 15.5.27. PDF trên Vercel dùng Chromium 153 với Puppeteer 25.11; Windows vẫn dùng Chrome/Edge cài sẵn.

Vercel Hobby dành cho dự án cá nhân phi thương mại, có hạn mức tài nguyên. Chi phí/hạn mức AI thuộc nhà cung cấp AI, tách với hosting. Không cần mua tên miền riêng để bắt đầu.

## 1. Chuẩn bị Supabase

1. Vào [Supabase Dashboard](https://supabase.com/dashboard), đăng nhập bằng GitHub, tạo tổ chức cá nhân và dự án Free tên `soan-nhan`. Tự đặt và giữ mật khẩu database; không đưa vào mã nguồn hay gửi trong hội thoại.
2. Chọn vùng gần người dùng (ví dụ Singapore nếu có), chờ dự án sẵn sàng.
3. Trong **SQL Editor**, chạy nội dung `supabase/schema.sql` **một lần trên dự án mới**. File đã có loại kế hoạch tháng, RLS, trigger tạo hồ sơ, quota giao dịch và giới hạn quyền sửa quota.
4. Nếu dùng database đã chạy schema trước đây, chỉ chạy migration còn thiếu: `20261014_ke_hoach_thang.sql`, `20261014_bao_ve_quota.sql`; không chạy lại toàn bộ schema trên database có dữ liệu.
5. Lấy **Project URL** và khóa phía client **anon / legacy anon** từ mục kết nối/API Keys. URL đặt vào `NEXT_PUBLIC_SUPABASE_URL`, khóa anon vào `NEXT_PUBLIC_SUPABASE_ANON_KEY`. App không cần `service_role`.

## 2. Tạo Vercel và import kho

1. Vào [Vercel Signup](https://vercel.com/signup), chọn **Continue with GitHub**, chọn gói Hobby cho dự án cá nhân phi thương mại.
2. Chọn **Add New → Project → Import Git Repository**, chọn `Quyhv1294/soan-nhan`. Cấp quyền riêng kho này nếu GitHub yêu cầu.
3. Tên gợi ý `soan-nhan-demo`; Framework **Next.js**, Root Directory `./`, Node **24.x**, Build `npm run build`, Install `npm ci`. Giữ Output Directory mặc định của Next.js.
4. Trước khi deploy, thêm biến môi trường dưới đây. Bật chúng ở Production và Preview nếu cần xem bản preview. Không sao chép cả `.env.local` vào kho Git.

| Biến | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL của Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Khóa anon phía client |
| `AI_PROVIDER` | `google` |
| `AI_API_KEY` | Khóa Gemini mới, chỉ phía máy chủ |
| `AI_MODEL_FAST` | ID mô hình có quyền dùng trong Google AI Studio; có thể để trống để dùng mặc định app |
| `AI_MODEL_STRONG` | ID mô hình có quyền dùng; có thể để trống |
| `FREE_GENERATIONS_PER_MONTH` | `20` hoặc hạn mức demo mong muốn |
| `NEXT_PUBLIC_FREE_GENERATIONS_PER_MONTH` | Cùng giá trị hạn mức ở trên |

Không cần đặt `CHROME_PATH` hoặc `VERCEL`; nền tảng tự cấp biến `VERCEL` để chọn Chromium đóng gói. Khi thay biến `NEXT_PUBLIC_*`, phải redeploy để cập nhật bundle trình duyệt.

5. Bấm **Deploy**, chờ trạng thái **Ready**. Vào **Settings → Domains** lấy địa chỉ production. Đây mới là URL gửi cho người ngoài; không giả định tên gợi ý còn trống.

## 3. Bật đăng nhập cho người ngoài

Sau khi có URL thật, ví dụ `https://soan-nhan-demo.vercel.app`:

1. Trong Supabase **Authentication → URL Configuration**, đặt **Site URL** bằng URL production thật.
2. Thêm **Redirect URL**: `https://<ten-du-an>.vercel.app/auth/callback` và `http://localhost:3000/auth/callback` nếu dùng máy cá nhân. Có thể cần mẫu `.../auth/callback**` cho callback có query `next` do app gửi; giới hạn theo đúng origin đang dùng.
3. App chỉ đăng nhập bằng email: bật **Email provider** trong **Authentication → Sign In / Providers** và cho phép người dùng mới đăng ký nếu muốn khách mới dùng thử. Người dùng nhận magic link rồi mở trên cùng trình duyệt đã yêu cầu đăng nhập (PKCE).
4. Để khách ngoài nhóm Supabase nhận magic link, cần cấu hình **Custom SMTP** với dịch vụ gửi email. SMTP mặc định chỉ phục vụ thử hạn chế, không dùng thay hệ thống gửi email cho khách công khai. Giữ mẫu email có đường dẫn xác nhận (`ConfirmationURL`) để người dùng bấm đăng nhập. Đăng nhập qua Google đã được gỡ khỏi giao diện và mã gọi OAuth; có thể tắt Google provider trong Supabase nếu không sử dụng ở nơi khác.
5. Kiểm tra **Deployment Protection** của Vercel để URL production cho phép người ngoài mở. Không cần mở công khai các bản preview nếu không dùng.

## 4. Sau khi deploy

Các thao tác nên kiểm tra bằng một tài khoản khách: đăng nhập → lưu hồ sơ → tạo bằng AI → lưu/mở lại thư viện → tải Word/PDF → đăng xuất. Phiên làm việc và kiểm tra trên máy cá nhân không xác nhận được cấu hình Supabase/SMTP hoặc Chromium ở Vercel.

Mã nguồn đã có lệnh kiểm tra kiểu và quét mẫu khóa trong nội dung sắp commit:

```powershell
npm run check:types
git add .
npm run check:secrets
git commit -m "Update Soan Nhan"
git push
```

Quét khóa không thay thế việc giữ bí mật. `.env.example` phải để trống khóa; `.env.local`, ảnh kiểm tra và thư mục build được ignore. Khóa AI từng xuất hiện trong file mẫu cần thu hồi và thay mới trong `.env.local` và Vercel; không đưa khóa mới vào Git.

Vercel tự nhận các lần push tiếp theo trên nhánh production đã chọn. Không dùng GitHub Pages để chạy trực tiếp bản này vì app cần API/server Next.js.

## Tài liệu chính thức

- [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- [Vercel và Git](https://vercel.com/docs/git)
- [Supabase đăng nhập email không mật khẩu](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp)
- [Chromium cho serverless](https://github.com/Sparticuz/chromium)

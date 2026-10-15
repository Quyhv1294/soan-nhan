# Soạn Nhàn — MVP

Trợ lý soạn bài cho giáo viên mầm non và tiểu học. App có chế độ demo cục bộ; đăng nhập, quota theo tài khoản và lưu dữ liệu Supabase hoạt động khi cấu hình Supabase.

## Chạy thử

```bash
npm install
npm run dev
# mở http://localhost:3000
```

## Cấu hình dịch vụ

Sao chép `.env.example` thành `.env.local`. Điền `AI_API_KEY` để bật Gemini. Để bật đăng nhập và đồng bộ dữ liệu, điền `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`, sau đó chạy `supabase/schema.sql` trong SQL Editor. App chỉ đăng nhập bằng đường dẫn qua email (magic link), không yêu cầu mật khẩu. Trong Supabase Auth, bật Email provider, cấu hình SMTP cho người dùng bên ngoài và thêm URL callback `{origin}/auth/callback` vào danh sách redirect được phép. Giữ `FREE_GENERATIONS_PER_MONTH` và `NEXT_PUBLIC_FREE_GENERATIONS_PER_MONTH` cùng giá trị để quota phía máy chủ và giao diện khớp nhau.

Khi thiếu Supabase trong môi trường phát triển, app cho phép xem demo và lưu bản demo trong trình duyệt. Môi trường production yêu cầu cấu hình Supabase và không cho truy cập API khi chưa đăng nhập.

Database đã được tạo trước khi có kế hoạch tháng: chạy riêng `supabase/migrations/20261014_ke_hoach_thang.sql` trong SQL Editor. Migration chỉ mở rộng loại tài liệu, giữ nguyên dữ liệu và quyền truy cập hiện có; không chạy lại toàn bộ `schema.sql` trên database đang sử dụng.

## Triển khai bản dùng thử có đăng nhập

Hướng dẫn từng bước: [GitHub → Supabase → Vercel](docs/trien-khai-vercel.md). Dùng Node.js 24; app cần Supabase và khóa AI đặt trong Environment Variables của Vercel. PDF có Chromium đóng gói riêng cho serverless. URL có sẵn dạng `*.vercel.app`, không cần mua tên miền.

Database đã tạo trước đợt triển khai cần chạy thêm `supabase/migrations/20261014_bao_ve_quota.sql` để người dùng chỉ sửa được các cột hồ sơ, không tự reset hạn mức soạn qua REST. Dự án mới chạy `schema.sql` đã bao gồm phần này. Không commit `.env.local` hoặc khóa thật vào `.env.example`.

## Kế hoạch tháng — nền dữ liệu

- Mở **Mầm non → Kế hoạch tháng** (điện thoại: **Công cụ → Kế hoạch tháng**). Chọn tháng/năm, độ tuổi, tên lớp, các GVCN và phạm vi ngày; đánh dấu ngày thực sự có học. Tuần ngắn, ngày nghỉ và lịch học cuối tuần đều được hỗ trợ.
- Ví dụ khung trong tài liệu tháng 10/2026: chọn 05–30/10/2026, chọn T2–T6 để có đúng bốn tuần, 20 ngày. Nhập chủ đề riêng từng tuần. App không tự thêm 01–02/10 vào lịch này.
- Mỗi cấp **chung cả tháng / chung cả tuần / riêng từng ngày** có đủ bảy nhóm. Một nhóm chứa nhiều phần có tên, nội dung nhiều dòng và thứ tự riêng; có thể thêm, xóa, sắp xếp phần. Ví dụ tách VĐCB/TCVĐ hoặc góc trọng tâm/chuẩn bị/kỹ năng mà không ghép thành một câu.
- Ở cấp tuần/ngày, **Bổ sung** giữ nội dung chung, **Thay thế** dùng riêng nội dung cấp đó, **Không áp dụng** bỏ nội dung nhóm tại phạm vi đó. **Chưa nhập / Dùng nội dung chung nếu có** không đồng nghĩa không áp dụng. Mục **Xem nội dung áp dụng** cho thấy cả nguồn tháng/tuần/ngày.
- Bấm **Lưu kế hoạch tháng**, sau đó mở lại từ **Thư viện tháng**. Khi lưu lỗi, nội dung đang nhập vẫn còn trên trang; có thể lưu lại. Chế độ demo lưu trên trình duyệt này, chế độ tài khoản lưu vào `documents` với quyền sở hữu hiện có. Nhân bản tạo ID mới cho mọi tuần, ngày, nhóm, phần và bỏ liên kết giáo án.
- **Chỉnh lịch học** giữ ID/nội dung của ngày còn trong lịch và khối chung của tuần còn ngày học; yêu cầu xác nhận khi bỏ ngày. Thay đổi chỉ được ghi vào thư viện khi bấm lưu.
- Kế hoạch tuần cũ tiếp tục dùng định dạng hiện tại. Các tuần/ngày trong kế hoạch tháng được lưu trong cùng tài liệu tháng, không tạo các bản tuần độc lập dễ lệch nội dung. AI soạn cả tháng được triển khai ở đợt sau.

Chi tiết mô hình, quy tắc áp dụng và nâng cấp: [docs/nen-du-lieu-ke-hoach-thang.md](docs/nen-du-lieu-ke-hoach-thang.md).

## Mục tiêu MT, biểu mẫu và giáo án từ tháng

- Trong kế hoạch tháng, mở **Bộ mục tiêu MT**: tạo bộ riêng; dùng 11 MT từ mẫu tháng 10 cho lớp 5–6 tuổi; hoặc sao chép bộ cùng độ tuổi từ một kế hoạch đã lưu. Mỗi bộ có nguồn, phiên bản, độ tuổi; từng mục tiêu có ID, mã, chỉ tiêu, mô tả và lĩnh vực tùy chọn. Mã trong mẫu là mã của tài liệu trường/lớp, không phải danh mục quốc gia mặc định.
- Mở đúng tuần/ngày rồi chọn nhóm để sửa từng ô. **Mục tiêu của ô** cho chọn nhiều MT. Mục **Rà soát mục tiêu** liệt kê ô có nội dung nhưng chưa có MT, kể cả MT kế thừa; bấm tên ô để tới vị trí chỉnh. MT đang được dùng cần được bỏ chọn ở các ô trước khi xóa khỏi bộ.
- Ở **Hoạt động học**, chọn một trong bảy loại tiết: văn học, chữ viết, toán, khám phá, vận động, âm nhạc, tạo hình. Nhập đề tài, lĩnh vực, tiết/mức độ, trạng thái học và phương pháp. Nút thêm phần theo loại tiết giữ riêng VĐCB/TCVĐ, NDTT/NDKH, làm quen tác phẩm/đàm thoại… Đổi loại tiết giữ các phần để cô rà lại.
- **Lưu và soạn giáo án** lưu kế hoạch rồi mở trình soạn với nội dung và MT của đúng ô. Tài khoản thật lấy lại kế hoạch thuộc chủ sở hữu trên máy chủ; demo gửi bản chụp ô đã được kiểm tra từ trình duyệt. Chỉ bản chụp ô và MT liên quan được gửi vào prompt, không gửi toàn bộ tháng. Giáo án lưu nguồn/phiên bản và mô tả MT tại lúc soạn, hiển thị trên bản xem trước và Word/PDF giáo án.
- Sau khi giáo án lưu thành công, app gắn vào đúng ID ô. Lưu giáo án và lưu liên kết có trạng thái riêng; **Thử gắn lại** không gọi AI thêm. Nếu ô/MT đổi trong lúc soạn hoặc liên kết vừa được người dùng thay đổi, app giữ giáo án trong thư viện và báo để cô kiểm tra trước khi gắn.
- **Gắn giáo án đã có** chọn tài liệu cùng độ tuổi trong thư viện; có thể đổi hoặc bỏ liên kết mà giữ giáo án. **Mở giáo án** đi tới bản đã lưu; **Về ô kế hoạch tháng** trở lại đúng ô gốc. Sửa MT/nội dung kế hoạch không tự sửa các giáo án đã lưu.
- Không cần migration mới cho đợt 2. Các trường mới là tùy chọn trong JSON tháng phiên bản 1; tài liệu đợt 1 tiếp tục mở được. Database chưa hỗ trợ loại tháng vẫn cần migration của đợt 1.

Chi tiết: [docs/muc-tieu-bieu-mau-lien-ket-giao-an.md](docs/muc-tieu-bieu-mau-lien-ket-giao-an.md).

## Bảng tháng và xuất theo mẫu

- Mở một kế hoạch đã lưu để xem **Bảng tháng**. Máy tính có cột nhóm/thứ cố định, các cột tuần và cột mục tiêu; có thể cuộn và lọc riêng một tuần. Điện thoại chọn tuần/ngày rồi đọc bảy thẻ nhóm hoạt động.
- **Chỉnh ô** mở đúng nhóm trong editor; menu **Chỉnh chung / ngoại lệ** cho chọn khối tháng/tuần hoặc ngày cụ thể. Chuyển giữa bảng và editor giữ các thay đổi chưa lưu. Nội dung chung được gộp theo ID nguồn; hai hoạt động riêng có chữ giống nhau vẫn giữ ô riêng.
- Bảng và file xuất dùng nội dung hiệu lực đã xét bổ sung/thay thế/không áp dụng, giữ riêng các phần của loại tiết. Mục tiêu được tổng hợp bằng ID từ những ngày thực sự có học; cột MT in cả mã, chỉ tiêu, mô tả. Ô chưa nhập, không áp dụng, không có lịch học và ngoài phạm vi có nhãn khác nhau.
- **Thiết lập kế hoạch → Thông tin và định dạng bản in** chọn Letter ngang (mặc định như mẫu) hoặc A4 ngang; Times New Roman 12/13/14pt, mặc định 14pt; lề trên/dưới 2cm, trái 3cm, phải 1,5cm. Có tên trường, tổ/khối, năm học, địa danh, ngày lập và họ tên các vị trí ký tùy chọn. Bấm lưu tháng để giữ cấu hình.
- **Tùy chọn kế hoạch → Xem bản in / Tải Word tháng / Tải PDF tháng**. Bản xem có thu/phóng, vừa chiều rộng, tải file và in. File dùng nội dung hiện tại kể cả thay đổi chưa lưu; lọc một tuần trên màn hình không làm đổi phạm vi file xuất tháng. Preview/PDF dùng cùng HTML đã escape; Word thật dạng `.docx` dùng cùng mô hình bảng.
- Cuối bảng có hàng **Chủ đề – Sự kiện**, hàng **Đánh giá KQ thực hiện** với hai phần giáo viên/ban giám hiệu như cấu trúc mẫu. Chưa nhập đánh giá thì giữ dòng trống. Ba vị trí ký là Ban giám hiệu, Khối trưởng, Giáo viên; không tự tạo chữ ký, nhãn ký số hay kết quả thực hiện.
- Header bảng được cấu hình lặp khi sang trang. Hàng nội dung cho phép tách qua trang, không cắt bằng chiều cao cố định. Word và Chrome có thể phân trang khác nhau; cần xem bản tải về trong công cụ sử dụng thực tế. PDF vẫn cần Chrome/Edge trên máy chủ như các loại tài liệu cũ.
- Không cần migration database mới; cấu hình in và đánh giá là các trường JSON tùy chọn trên tài liệu tháng hiện có.

Chi tiết mô hình bảng và giới hạn kiểm chứng: [docs/bang-thang-va-xuat-tai-lieu.md](docs/bang-thang-va-xuat-tai-lieu.md).

## Chỉnh sửa và lưu tài liệu

- Phiếu học tập có **12 bố cục**: tô màu, nối hình, đếm/khoanh, điền chữ/số, tìm điểm khác, làm quen nét, tìm chữ, tô chữ, quy luật, so sánh, tách/gộp và cộng/trừ. **Tạo bằng AI** sinh dữ kiện mới theo chủ đề/độ tuổi/yêu cầu; mặc định AI tự chọn dạng bài, hoặc giữ mẫu cô chọn. Có sửa từng bài và áp dụng, tạo bộ khác, khôi phục nội dung trước. Phạm vi 3–10, 1–6 chữ cái, AB/AAB/ABB; bản xem, in và PDF dùng cùng nội dung đã sinh. Hình minh họa vẫn dùng kho vector có sẵn; tô chữ là nét viền, không thay hướng dẫn thứ tự nét của cô.
- Trò chơi có **7 kiểu**; AI sinh câu hỏi, cặp thẻ, nhiệm vụ hoặc các bước mới theo chủ đề bất kỳ, độ tuổi/lớp, số câu 3–10 và yêu cầu thêm. Có tự chọn kiểu trò chơi hoặc giữ kiểu đang chọn, tạo bộ khác, sửa nội dung, trình chiếu, chơi lại và lưu. Trắc nghiệm/đúng-sai chấm theo đáp án; câu hỏi mở để cô nhận xét. **21 bộ có sẵn** vẫn dùng được qua mục riêng, không tự đổ vào trò chơi mới. Chi tiết: [docs/phieu-va-tro-choi.md](docs/phieu-va-tro-choi.md).
- Phiếu/trò chơi AI dùng cấu hình Gemini `AI_API_KEY` hiện có, cùng kiểm soát đăng nhập/hạn mức của `/api/generate`. Thiếu khóa sẽ báo dịch vụ chưa cấu hình, không giả lập nội dung mẫu thành kết quả AI. Tạo không tự lưu; lỗi lưu có thể thử lại trên nội dung đã tạo mà không gọi AI lần nữa.
- Giáo án mầm non và KHBD có nút **Chỉnh sửa** để sửa thông tin, mục tiêu, đồ dùng và các hoạt động; có thể thêm/xóa hoạt động hoặc bước thực hiện. **Hoàn tác / Làm lại** áp dụng trong lần chỉnh sửa hiện tại; **Hủy chỉnh sửa** giữ nội dung trước đó.
- Khi lưu chỉnh sửa hoặc soạn lại, app giữ tối đa năm phiên bản trước trong tài liệu. Có thể khôi phục sau khi mở lại tài liệu. Việc soạn lại và khôi phục giữ ID tài liệu để các liên kết từ kế hoạch tuần tiếp tục hoạt động.
- Trạng thái **Đang soạn / Đang lưu / Đã lưu** được hiển thị riêng. Nếu lưu thất bại, giữ trang mở và bấm **Thử lưu lại**; app dùng đúng nội dung đã tạo, không gọi AI thêm. Cơ chế này áp dụng cho giáo án, KHBD, kế hoạch tuần và tin nhắn phụ huynh. PDF/Word lấy nội dung đang xem sau khi cô áp dụng chỉnh sửa.

## Cá nhân hóa, soạn trên điện thoại và thư viện

- Hồ sơ lớp dùng chung cho biểu mẫu và điều hướng. Mầm non điền sẵn độ tuổi; tiểu học điền lớp, bộ sách. Mở giáo án từ kế hoạch tuần sẽ ưu tiên tên hoạt động, lĩnh vực, chủ đề và độ tuổi của kế hoạch đó. Thông tin của tài liệu đã lưu luôn được ưu tiên khi mở lại.
- Trên điện thoại, nút **Soạn bài** đổi theo cấp học; **Công cụ** mở toàn bộ chức năng và tài khoản. Giáo án, KHBD và phiếu học tập có hai tab **Thông tin / Bản soạn**, thanh thao tác cuối màn hình và bản xem lớn có điều chỉnh mức phóng to. Giáo án/KHBD tự mở kết quả sau khi soạn; phiếu tự mở bản xem sau khi lưu.
- Thư viện đếm và lọc trên cùng tập dữ liệu, hỗ trợ tìm không dấu, giữ từ khóa/bộ lọc/cách sắp xếp trong URL, mặc định mới cập nhật trước. Trong chế độ demo chỉ hiển thị tài liệu thực sự được lưu trên trình duyệt này.
- Có thể đổi tên hiển thị, nhân bản hoặc xóa tài liệu. Nhân bản không gọi AI; bản sao có ID riêng và không mang lịch sử phiên bản của bản gốc. Khi nhân bản kế hoạch tuần/tháng, các hoạt động/phần có ID riêng và cần soạn giáo án riêng. Xóa giáo án sẽ bỏ liên kết tương ứng trong kế hoạch tuần và tháng.
- `PATCH /api/documents` nhận `{ id, action: "rename" | "duplicate", title? }`; `DELETE /api/documents` nhận `{ id }`. Các thao tác kiểm tra chủ sở hữu; tên hiển thị riêng được giữ khi lưu lại nội dung bài dạy.
- Thư viện hiện hiển thị tối đa 200 tài liệu cập nhật gần nhất. Chế độ demo giới hạn 200 tài liệu khi nhân bản.

## Hồ sơ và phân cấp thao tác

- Hồ sơ mầm non chỉ hiện cấp học, độ tuổi và tên lớp. Hồ sơ tiểu học có lớp đang dạy và bộ sách; danh sách bộ sách không có lựa chọn “Không áp dụng”. Khi lưu mầm non, giá trị bộ sách được đặt về “Không áp dụng” để giữ tương thích dữ liệu demo hiện có.
- Bước thiết lập dùng nút **Bắt đầu soạn bài**; trang Tài khoản dùng **Lưu thay đổi** và giữ cô ở trang hiện tại khi lưu xong.
- Vùng soạn ưu tiên một hành động chính. Giáo án/KHBD có **Soạn** khi chưa có nội dung, **Chỉnh sửa** khi đã có bản soạn, **Lưu thay đổi** khi chỉnh sửa. Phiếu ưu tiên **Lưu phiếu**, tin nhắn ưu tiên **Sao chép tin nhắn**; khi lưu lỗi, **Thử lưu lại** được làm nổi bật.
- **Tùy chọn** gom xem lớn, tải Word/PDF, in và liên kết tạo tài liệu phụ. Menu nằm trên các lớp giao diện khác, tự đặt vị trí trong khung nhìn và đóng bằng Escape hoặc bấm bên ngoài. Lỗi tải file được giữ trong menu để cô có thể thử lại.
- Ô nhập và nút dùng chữ 16px; nhãn 16px, chữ gợi ý 14px. Khung bản nháp trống giữ nền vở ô ly; vùng soạn giảm bóng đổ trên các thẻ để đọc, chỉnh nội dung lâu hơn.

## Giao diện sáng / tối

- Đổi nhanh bằng nút mặt trời/mặt trăng trên thanh đầu trang ở điện thoại và các trang công khai; thanh bên máy tính có lựa chọn **Sáng / Tối**. Trang **Tài khoản → Giao diện** cũng có hai lựa chọn này.
- Lựa chọn được lưu riêng trên trình duyệt bằng khóa `soan-nhan:giao-dien` và đồng bộ giữa các tab. Khi chưa từng chọn, giao diện theo chế độ sáng/tối của thiết bị. Đổi giao diện không cần lưu lại hồ sơ lớp.
- Màu nền, chữ, biểu mẫu, menu, hộp thoại và dòng kẻ ô ly thay đổi theo chế độ. Giấy xem trước tài liệu, PDF/Word, bản in và nội dung trình chiếu giữ màu gốc. Giao diện được áp dụng trước khi vẽ trang để tránh chớp nền sáng khi tải lại chế độ tối.

## Kiểm tra UX

```bash
npm run check:types
npm run test:ux
# Cần app đang chạy và Chrome/Edge trên máy:
npm run test:ux-browser
npm run test:theme
```

Kiểm tra trình duyệt dùng hồ sơ riêng và giả lập API AI/lưu tài liệu, không tốn quota hoặc sửa dữ liệu người dùng. Bộ kiểm tra trình duyệt hiện bao phủ năm mẫu PDF ban đầu một trang A4, giao diện điện thoại, sửa/hoàn tác/khôi phục sau khi tải lại, và thử lưu lại khi mạng lỗi. Chưa bao phủ bảy phiếu mới và bốn trò chơi mới. Ảnh/PDF kiểm tra nằm ở `artifacts/ux-check/`; có thể đặt `UX_BASE_URL` nếu server dùng cổng khác hoặc `CHROME_PATH` nếu trình duyệt được cài ở đường dẫn khác.

`test:theme` xem 12 trang trên máy tính, 4 bố cục điện thoại và menu tài liệu. Script đo các mẫu chữ, placeholder và viền ô nhập theo màu CSS đã render; kiểm tra đổi chủ đề, nhớ lựa chọn sau tải lại, đồng bộ hai tab và bản in trắng. Ảnh cùng báo cáo nằm trong `artifacts/ux-check/dark-theme/`. Gradient và chi tiết minh họa vẫn cần xem ảnh bằng mắt; kết quả này không thay thế đánh giá toàn bộ khả năng tiếp cận của app.

## Bản đồ trang

| Đường dẫn | Màn hình | Tính năng |
| --- | --- | --- |
| `/` | Trang giới thiệu | — |
| `/dang-nhap` | Đăng nhập bằng đường dẫn gửi qua email | F1 |
| `/bat-dau` | Hồ sơ lớp (cấp học, độ tuổi, bộ sách) | F1 |
| `/tong-quan` | Việc của tuần này | — |
| `/ke-hoach-thang` | Bảng tháng, chỉnh tuần/ngày, MT, giáo án, Word/PDF theo mẫu | — |
| `/ke-hoach-tuan` | Lưới 5 ngày × 5 buổi | F2 |
| `/giao-an/moi` | Soạn giáo án mầm non 3 cột | F3 |
| `/ke-hoach-bai-day` | Kế hoạch bài dạy tiểu học (CV 2345) | F4 |
| `/phieu-hoc-tap` | AI tạo bài mới, 12 dạng phiếu, chỉnh từng bài, PDF A4 | F5 |
| `/tro-choi` | AI tạo nội dung cho 7 trò chơi, 21 bộ mẫu tùy chọn, trình chiếu | F6 |
| `/tin-nhan-phu-huynh` | Tin nhắn Zalo, sao chép một chạm | F7 |
| `/thu-vien` | Tìm, lọc tài liệu đã soạn | F8 |
| `/tai-khoan` | Hồ sơ, lượt soạn | F1 |
| `POST /api/generate` | API soạn bài: gọi Gemini nếu có `AI_API_KEY`, không thì trả dữ liệu mẫu | — |
| `POST /api/export/docx`, `/api/export/pdf` | Xuất Word/PDF; tháng chọn Letter/A4 ngang | F3–F5 |

## Cấu trúc thư mục

```
src/
  app/
    page.tsx                 trang giới thiệu
    dang-nhap/, bat-dau/     đăng nhập, hồ sơ lớp
    (app)/                   các trang sau đăng nhập, dùng chung AppShell
    auth/callback/           đổi mã OAuth/magic link thành phiên đăng nhập
    api/                      API tạo nội dung, hồ sơ và thư viện; kiểm tra phiên đăng nhập
  lib/supabase/               client trình duyệt, server và truy vấn dữ liệu
  components/
    AppShell.tsx             thanh bên (máy tính), thanh dưới (điện thoại)
    SoanBai.tsx              bố cục trình soạn: biểu mẫu + xem trước
    GiaoAnPreview.tsx        xem trước giáo án / KHBD như bản Word
    ui.tsx                   nút, ô nhập, logo, tiêu đề trang
  lib/
    types.ts                 khuôn JSON cố định cho mọi đầu ra AI
    prompts.ts               khung prompt từng loại
    mock-data.ts             dữ liệu mẫu (thay bằng dữ liệu thật)
    site.ts                  tên sản phẩm, menu
supabase/schema.sql          bảng dữ liệu + RLS + quota giao dịch
```

## Hệ thống thiết kế

Lấy chất liệu từ lớp học Việt Nam, định nghĩa trong `src/app/globals.css`:

| Token | Màu | Dùng cho |
| --- | --- | --- |
| `bang` | #1E4B3A xanh bảng | nút chính, mục đang chọn |
| `giay` | #FAFAF6 giấy | nền trang |
| `oly` | #D5E0EE kẻ ô ly | lưới nền, ô trống |
| `muc` | #1D2433 mực | chữ |
| `phan` | #F3D36B phấn vàng | đánh dấu "đã soạn", nút trên nền tối |
| `butdo` | #C2352B bút đỏ | lề vở, thông báo lỗi (dùng rất ít) |

- Chữ giao diện: **Be Vietnam Pro** (thiết kế riêng cho dấu tiếng Việt).
- Chữ văn bản xem trước: **Tinos** (thay thế Times New Roman) để giống bản Word giáo viên nộp.
- Chi tiết nhận diện: nền **vở ô ly có lề đỏ** (`.o-ly`, `.le-do`), chỉ dùng ở hero, trang đăng nhập và ô xem trước trống.

## Việc tiếp theo (theo kế hoạch 14 ngày)

- [x] Supabase Auth, `middleware.ts` kiểm tra phiên và bảo vệ API/trang làm việc
- [x] Ngày 3: prompt thật trong `lib/prompts.ts`; đã nối Gemini (giáo án, KHBD, kế hoạch tuần, tin nhắn, phiếu và trò chơi). Chưa so sánh nhiều mô hình
- [x] Lưu tài liệu đã tạo vào `documents`, kế hoạch tuần vào thư viện
- [x] Ngày 6: `/api/export/docx` bằng thư viện `docx` (giáo án, KHBD, kế hoạch tuần)
- [x] Ngày 8: `/api/export/pdf` bằng `puppeteer-core` (giáo án, KHBD, kế hoạch tuần, phiếu học tập). Cần Chrome/Edge trên máy chủ, tự tìm ở chỗ cài mặc định hoặc đặt `CHROME_PATH`
- [x] 7 trò chơi trình chiếu, kiểm tra nội dung trước khi chơi/lưu, chơi lại và mở từ thư viện
- [ ] Kiểm tra thực tế các mẫu phiếu/trò chơi mới và triển khai Supabase/AI

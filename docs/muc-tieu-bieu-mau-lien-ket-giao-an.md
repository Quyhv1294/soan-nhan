# Đợt 2 — Mục tiêu, biểu mẫu và liên kết giáo án

Triển khai theo phân tích file `kehoachgiaoduc-1791170229437.doc` do người dùng cung cấp. Đọc cột MT tại máy để trích 11 mã và mô tả, không đưa thông tin nhận diện trẻ trong tài liệu vào dữ liệu mẫu.

Cập nhật tiếp theo: [đợt 3 — bảng tháng và xuất Word/PDF theo mẫu](bang-thang-va-xuat-tai-lieu.md) đã được bổ sung; tài liệu này mô tả phạm vi đợt 2.

## 1. Bộ mục tiêu

`KeHoachThang.boMucTieu?` chứa `{id, ten, nguon, phienBan, doTuoi, mucTieu[]}`. Mục tiêu gồm `{id, ma, chiTieu, moTa, linhVuc?}`. Ô nhóm hoạt động tham chiếu bằng `mucTieuIds[]`; nội dung hiển thị lấy từ bộ của chính kế hoạch.

- Bộ mẫu có MT40, MT43, MT95, MT66, MT9, MT8, MT22, MT49, MT16, MT65, MT38; chỉ tiêu và mô tả lấy từ cột MT của tài liệu. MT65 giữ cả 1.1 và 1.3; không tự tách thành mã mới. Không suy đoán lĩnh vực cho các mục tiêu chưa được phân loại trong file.
- Bộ mẫu chỉ dùng trực tiếp cho lớp 5–6 tuổi. Độ tuổi của kế hoạch và bộ phải khớp. Giao diện khóa đổi độ tuổi khi đã có bộ; có thể chủ động gỡ bộ trước khi đổi.
- Có thể tạo bộ riêng hoặc lấy lại bộ cùng độ tuổi từ kế hoạch đã lưu. Bản sao nhận ID bộ/MT mới; nguồn/phiên bản được giữ. Sửa bộ trong một kế hoạch không làm đổi tháng khác hay giáo án đã soạn.
- Không tự gắn mục tiêu vào các ô chỉ dựa trên mã xuất hiện trong văn bản. Giáo viên chọn MT cụ thể. Trạng thái chưa gắn được báo trong danh sách rà soát, không chặn lưu bản nháp.
- Danh sách rà soát chỉ tính ô riêng có nội dung, đã xét MT kế thừa qua tháng → tuần → ngày. `bo-sung` hợp các ID, `thay-the` dùng ID ở cấp đó, `khong-ap-dung` xóa mục tiêu áp dụng cùng nội dung. Các ô chưa nhập/không áp dụng không được coi là thiếu MT.
- Không xóa MT còn tham chiếu. Gỡ cả bộ yêu cầu xác nhận và bỏ các tham chiếu trong tháng; giữ nội dung và giáo án đã lưu.

## 2. Loại tiết và từng ô

`NoiDungNhom.tietHoc?` chỉ dành cho nhóm `hoc`, chứa loại tiết, đề tài, lĩnh vực, tiết/mức độ, trạng thái trẻ, phương pháp. Giữ năm lĩnh vực riêng với bảy loại tiết; lĩnh vực gợi ý khi chọn loại vẫn có thể điều chỉnh.

| Loại tiết | Các phần gợi ý |
| --- | --- |
| Văn học | Làm quen tác phẩm, đàm thoại |
| Chữ viết | Làm quen chữ viết, luyện tập |
| Toán | Nội dung trọng tâm, luyện tập |
| Khám phá | Nội dung khám phá, trải nghiệm |
| Vận động | VĐCB, TCVĐ |
| Âm nhạc | NDTT, NDKH |
| Tạo hình | Nội dung tạo hình, kỹ năng |

Các phần là những khối có ID riêng, tên và nội dung nhiều dòng; không ghép nội dung chính/kết hợp vào một tên đề tài. Giáo viên chủ động thêm phần cần dùng; không ép mọi tiết phải có đủ các phần gợi ý. Thêm phần tận dụng ô phần đầu còn trống khi có thể. Đổi loại tiết không xóa nội dung cũ.

Phần **Xem nội dung áp dụng** thể hiện nguồn tháng/tuần/ngày, MT được dùng và nút tới ô gốc. Chỉnh nội dung chung ở đúng nguồn để tránh tạo bản sao riêng ngoài ý muốn. Danh sách rà soát cũng đi tới đúng tuần/ngày/nhóm theo ID.

## 3. Liên kết giáo án

`NoiDungNhom.giaoAnId?` là giáo án của cả ô; các `PhanNoiDung.giaoAnId?` có từ đợt 1 vẫn được giữ và mở được. Không tạo giáo án tự động khi chỉ nhập kế hoạch.

### Soạn mới từ ô

1. **Lưu và soạn giáo án** kiểm tra, lưu các thay đổi của tháng trước khi chuyển trang.
2. URL chỉ mang ID tháng và ID ô. Trang giáo án đọc kế hoạch đã lưu để lấy chủ đề tuần/tháng, ngày thực, độ tuổi, loại tiết, nội dung hiệu lực và các MT đã chọn.
3. Với tài khoản thật, API đọc lại kế hoạch theo chủ sở hữu. Demo chỉ có localStorage nên gửi bản chụp riêng ô, có kiểm tra cấu trúc/ID/độ tuổi/nguồn MT. Không gửi cả tháng lên AI.
4. AI nhận mô tả MT và nội dung theo phần. Metadata nguồn không lấy từ đầu ra AI: máy chủ gắn vào `GiaoAnMamNon.nguCanhKeHoach`. Bộ kiểm tra kết quả từ chối mã dạng MT số không nằm trong các mã đã chọn; prompt cũng không cho suy diễn mã hay trạng thái đã thực hiện.
5. Lưu giáo án trước, sau đó gắn ID vào ô bằng endpoint riêng. Lưu lỗi giữ bản đang có và cho thử lại; lỗi gắn không được báo thành lỗi lưu giáo án và có nút **Thử gắn lại**, không gọi AI.

Ngữ cảnh giới hạn 20.000 ký tự JSON. Vượt giới hạn thì báo lỗi để giáo viên chia/rút gọn; không âm thầm cắt nội dung hoặc bỏ MT. Request API có giới hạn 128 KB. Chế độ không có khóa AI vẫn dùng nội dung thân bài mẫu như trước, có nhãn mẫu và giữ bản chụp ngữ cảnh; thân bài mẫu chưa được cá nhân hóa đầy đủ theo loại tiết/MT.

### Giáo án có sẵn

Chọn **Gắn giáo án đã có** để tìm trong các giáo án cùng độ tuổi đã tải về (tối đa 200 tài liệu gần nhất). Thao tác này không dùng lượt AI. Đổi/bỏ liên kết giữ giáo án trong thư viện. Mở giáo án được gắn từ ô có loại tiết sẽ mang liên kết trở lại tháng, hỗ trợ soạn lại và gắn đúng ô.

Giáo án giữ bản chụp nguồn. Chỉnh bộ MT hay nội dung kế hoạch không tự cập nhật giáo án. Soạn lại từ chính ô sẽ nhận ngữ cảnh hiện hành; chỉnh thân bài/khôi phục phiên bản của giáo án giữ metadata nguồn của phiên bản đó. Khi soạn lại giáo án độc lập từ thư viện, nếu không có ngữ cảnh tháng mới, giữ bản chụp nguồn đang có.

## 4. Tránh ghi đè và dữ liệu mồ côi

`POST /api/month-plans/link-lesson` nhận `{planId, nhomId, lessonId: UUID|null, expectedId: UUID|null, tuDong?: boolean}`.

- Kiểm tra tài khoản sở hữu cả kế hoạch và giáo án; giáo án cần cùng độ tuổi. Demo kiểm tra trên kho cùng trình duyệt.
- Tìm đúng ô theo ID, đọc bản tháng mới nhất rồi chỉ sửa liên kết. Không ghi lại bản tháng cũ do trang giáo án giữ.
- Kiểm tra liên kết cũ và `cap_nhat` trước khi ghi. Gửi lại cùng một liên kết là thao tác lặp an toàn; xung đột được báo để mở lại kế hoạch.
- Khi tự gắn giáo án mới, đối chiếu bản chụp nguồn với ô hiện hành. Nếu nội dung/MT đã đổi trong lúc soạn, giữ giáo án đã lưu và yêu cầu giáo viên kiểm tra, gắn thủ công sau đó.
- Nhân bản tháng cấp lại ID bộ/MT và mọi tuần/ngày/nhóm/phần, ánh xạ lại `mucTieuIds`, bỏ liên kết giáo án ở cả ô và phần.
- Xóa giáo án bỏ liên kết tại cả cấp ô và cấp phần trong kế hoạch tháng, đồng thời giữ hành vi với kế hoạch tuần cũ.
- Xóa kế hoạch tháng giữ các giáo án trong thư viện và bản chụp nguồn lịch sử của chúng.

## 5. Xem trước và xuất giáo án

Một hàm dùng chung tạo các dòng ngữ cảnh cho preview, Word và PDF giáo án: tháng/ngày, loại tiết, mức độ, trạng thái trẻ, phương pháp, từng phần nội dung và mã/mô tả MT cùng nguồn/phiên bản. Giữ tiến trình giáo án ba cột hiện có. Đây chưa phải xuất bảng kế hoạch tháng của đợt 3.

## 6. Tương thích và kiểm tra thực hiện

Không cần migration database mới. Dùng các trường JSON tùy chọn trên tháng phiên bản 1 và giáo án hiện tại. Các tháng đợt 1 và kế hoạch tuần cũ vẫn mở được. Nếu database chưa hỗ trợ tài liệu tháng, vẫn cần migration đợt 1.

Đã chạy `npm run check:types`. Chưa chạy kiểm thử tự động, trình duyệt, gọi AI thật, xuất file thực tế hoặc thử trên Supabase thật trong đợt này. Đây là giới hạn kiểm chứng hiện tại, không phải xác nhận toàn bộ luồng đã chạy thành công.

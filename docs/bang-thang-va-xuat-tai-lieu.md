# Đợt 3 — Bảng tháng, Word và PDF theo mẫu

Triển khai theo [phân tích kế hoạch giáo dục tháng 10](phan-tich-mau-ke-hoach-thang-10.md), trên nền dữ liệu đợt 1 và bộ MT/biểu mẫu đợt 2. Không tự nhập toàn bộ hoạt động từ tài liệu gốc; bản xuất lấy dữ liệu giáo viên đã nhập trong app.

## 1. Bố cục tháng

Màn hình máy tính và bản xuất có hai cột nhãn (nhóm/thứ), mỗi tuần một cột, cuối cùng là cột mục tiêu. Bốn tuần tạo bảy cột logic như file gốc; các tháng khác hỗ trợ 1–6 tuần, ngày học không liên tiếp và học cuối tuần.

`src/lib/bang-ke-hoach-thang.ts` dựng một mô hình bảng dùng chung gồm dòng nội dung, vị trí cột, số hàng/cột gộp, tham chiếu tới ô gốc và MT. UI React, HTML/PDF và DOCX đều đọc mô hình này; không có ba bộ quy tắc riêng để suy ra nội dung.

### Nội dung và gộp ô

- Dùng quy tắc hiệu lực tháng → tuần → ngày, với bổ sung/thay thế/không áp dụng đã có ở đợt 1–2.
- Khi không có ngoại lệ theo ngày, nhóm dùng chung thể hiện trong một hàng; các tuần có cùng nguồn được gộp ngang. Khối chung tháng được ghi rõ.
- Nhóm chia theo ngày có các hàng thứ dựa trên lịch thực. Nội dung được kế thừa cùng nguồn có thể gộp dọc trong một tuần; ngoại lệ được tách riêng.
- Chỉ gộp khi cùng ID nguồn, phần và MT. Hai hoạt động nhập riêng có cùng chữ không bị coi là cùng một hoạt động.
- Nội dung loại tiết, đề tài, lĩnh vực, tiết/mức độ, trạng thái trẻ, phương pháp và các phần con được giữ riêng trong ô. Không cắt chuỗi tên hoặc nội dung theo chiều cao.
- Các ô chưa nhập, không áp dụng, không có lịch học, ngoài phạm vi được phân biệt. Ngày bị bỏ chọn không được tạo hoạt động để lấp vào bảng.
- Cột MT tổng hợp những ID thực sự áp dụng cho các ngày học của nhóm, lấy mã/chỉ tiêu/mô tả từ bộ trong chính tài liệu. Các mục tiêu có trong bộ nhưng chưa gắn không được tự đưa vào cột này.
- Hai hàng cuối giữ cấu trúc của mẫu: **Chủ đề – Sự kiện** theo từng tuần; **Đánh giá KQ thực hiện** với phần giáo viên và ban giám hiệu gộp ở phần còn lại của bảng.

Khối chung có ngoại lệ có thể được thể hiện lại trong các cột tuần để giữ đúng nội dung hiệu lực. Dữ liệu gốc vẫn chỉ có một khối chung, không tạo thêm bản sao lưu trữ.

## 2. Sử dụng trên máy tính và điện thoại

Máy tính giữ cột nhóm/thứ và hàng tiêu đề khi cuộn. Có bộ lọc toàn tháng/một tuần. **Chỉnh ô** chuyển tới đúng nhóm trong editor; menu cạnh nút cho chọn khối chung hoặc ngoại lệ. Có thể mở giáo án đã gắn. Chuyển bảng/editor giữ thay đổi đang nhập và phạm vi xem.

Điện thoại hiển thị bộ chọn tuần/ngày cùng bảy thẻ nhóm, đã kết hợp nội dung chung và riêng. Mô tả MT mở khi cần. Bản in giữ bố cục tháng nhiều cột, có thu/phóng và vừa chiều rộng để xem trên màn hình nhỏ.

Màn hình lọc một tuần chỉ đổi cách xem; **Tải Word tháng / Tải PDF tháng** luôn xuất toàn bộ tháng. Chức năng xuất tuần cũ tiếp tục dùng luồng kế hoạch tuần hiện có.

## 3. Cấu hình bản in

Các trường JSON mới đều tùy chọn để tháng đợt 1–2 tiếp tục mở được:

```text
trinhBay?: { khoGiay: "Letter" | "A4", coChu: 12 | 13 | 14 }
thongTinIn?: {
  tenTruong, toKhoi, namHoc, diaDanh, ngayLap,
  banGiamHieu, khoiTruong
}
danhGia?: { giaoVien, banGiamHieu }
```

Mặc định **Letter ngang, Times New Roman 14pt**, theo khai báo trang và nội dung chủ yếu trong mẫu. Lề trên/dưới 20mm, trái 30mm, phải 15mm. Có lựa chọn A4 ngang và cỡ 12/13pt. Chiều rộng cột được chuẩn hóa theo vùng in, không sao chép tổng phần trăm 97% từ HTML cũ. Phần nhãn chiếm 17%, các tuần chia 66%, cột MT 17% để có chỗ cho mô tả dài.

Tên lớp/GVCN lấy từ kế hoạch. Các thông tin trường, tổ/khối, năm học, địa danh/ngày lập và họ tên ở vị trí ký được nhập thủ công. Ngày lập để trống sẽ in chỗ điền, không tự lấy ngày hiện tại hoặc ngày phê duyệt trong mẫu.

Đánh giá trống giữ các dòng chấm. Nếu được nhập, in nguyên nội dung thực tế và xuống dòng. Ba vị trí ký là Ban giám hiệu, Khối trưởng, Giáo viên, có khoảng trống và họ tên đã nhập. Không sinh hình chữ ký, nhãn “Đã ký số”, trạng thái đã duyệt hay kết quả đạt mục tiêu. Quy trình phê duyệt/lịch sử đánh giá thuộc đợt 4.

## 4. Xem trước và xuất file

- `ke-hoach-thang-html.ts` tạo HTML đã escape. Bản xem và PDF dùng cùng nội dung/CSS; không nạp HTML, ảnh, script hoặc font từ tài liệu gốc/URL người dùng nhập.
- Xem trước là giấy liên tục để đọc và kiểm tra nội dung. Thu/phóng chỉ tác động bản xem, không đổi cỡ chữ trong file.
- `.docx` được tạo bằng thư viện `docx`, không đổi đuôi HTML thành Word. Có grid cột cố định, gộp ngang/dọc thật và header được đánh dấu lặp.
- PDF dùng Chrome/Edge hiện có, khổ Letter/A4 ngang cùng CSS trang và lề. Không có Chrome thì trả lỗi hỗ trợ hiện tại, vẫn có Word và in từ trình duyệt.
- Hàng nội dung cho phép tách trang; không có chiều cao cố định/ẩn overflow ở vùng in. Header lặp theo cơ chế của Word/Chrome. Khối vị trí ký được gợi ý giữ liền khi còn đủ chỗ.
- File xuất lấy bản đang xem, kể cả thay đổi chưa lưu. Bản xem lớn giữ một bản chụp nhất quán khi mở. Muốn mở lại các thay đổi từ thư viện cần bấm **Lưu kế hoạch tháng**.
- Dữ liệu sai khuôn được chặn trước khi tạo file và ở API với thông báo 422; giới hạn JSON vẫn 1 MB. PDF/Word cũ giữ luồng và khổ giấy trước đây.

Số trang và vị trí ngắt trang có thể khác giữa Microsoft Word, LibreOffice và Chrome do bộ chữ và bộ dàn trang. Không khẳng định trùng số trang hay từng tọa độ với file `.doc` gốc.

## 5. Lưu trữ và phạm vi

Không cần migration mới; các trường dùng `documents.noi_dung` hiện có. Bộ kiểm tra tháng kiểm tra cả khổ giấy/cỡ chữ, thông tin in, ngày lập và độ dài đánh giá. Nhân bản giữ cấu hình và các nội dung văn bản hiện có theo hành vi sao chép tài liệu; không tạo thêm xác nhận ký/duyệt.

Chưa triển khai nhập mẫu tự động, AI soạn cả tháng/từng ô, khóa ô hoặc quy trình duyệt trong đợt này. Không tự viết lại mục tiêu hay đánh giá khi xuất.

## 6. Kiểm chứng hiện tại

Đã chạy `npm run check:types`. Đã đối chiếu cấu trúc bảng và hai hàng cuối của HTML gốc bằng đọc dữ liệu tại máy; đã đọc API `rowSpan`, hướng trang và hàng lặp trong thư viện `docx` đang cài.

Chưa chạy kiểm thử tự động/trình duyệt; chưa tạo và mở bản Word/PDF thực tế hoặc đối chiếu ngắt trang bằng Microsoft Word trong đợt này. Cần kiểm tra bản xuất thực tế trước khi xác nhận độ khớp trình bày và phân trang.

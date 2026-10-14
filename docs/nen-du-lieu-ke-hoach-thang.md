# Nền dữ liệu kế hoạch tháng — đợt 1

Triển khai ngày 14/10/2026 theo [phân tích mẫu tháng 10](phan-tich-mau-ke-hoach-thang-10.md). Không nhập tự động nội dung hay thông tin cá nhân từ tài liệu gốc.

Cập nhật: đợt 2 đã bổ sung bộ MT, loại tiết, chỉnh từng ô và liên kết giáo án; xem [chi tiết triển khai đợt 2](muc-tieu-bieu-mau-lien-ket-giao-an.md). Nội dung dưới đây mô tả nền của đợt 1.

## 1. Phạm vi

Đã bổ sung tài liệu `ke-hoach-thang`, mô hình tháng → tuần → ngày, bảy nhóm hoạt động, nội dung nhiều phần và biểu mẫu nhập cơ bản. Lưu/mở, tìm/lọc, đổi tên, nhân bản và xóa dùng thư viện hiện có.

Các phần tiếp theo vẫn tách riêng: danh mục MT và biểu mẫu chuyên môn; liên kết soạn giáo án từ kế hoạch tháng; bảng tháng theo mẫu và xuất Word/PDF; AI theo ngữ cảnh, nhập mẫu, đánh giá, duyệt.

## 2. Một nguồn dữ liệu

`documents.loai = 'ke-hoach-thang'`, `documents.noi_dung` chứa `KeHoachThang` với `phienBan: 1`:

```text
KeHoachThang
  id, phienBan, thang (YYYY-MM), chuDe, doTuoi, tenLop, giaoVien[]
  tuNgay, denNgay (YYYY-MM-DD)
  nhom[7]                       nội dung chung cả tháng
  tuan[]
    id, chuDe, tuNgay, denNgay
    nhom[7]                     nội dung chung tuần
    ngay[]
      id, ngay (YYYY-MM-DD)
      nhom[7]                   nội dung riêng từng ngày

NoiDungNhom
  id, nhom (mã ổn định), trangThai, cachApDung
  phan[]
    id, tieuDe, noiDung (nhiều dòng), giaoAnId? (dành cho bước liên kết sau)
```

Không tạo tài liệu tuần thứ hai chứa bản sao các hoạt động của tháng. Không chép nội dung chung vào từng ngày. Hàm `noiDungHieuLuc` tính nội dung dùng tại thời điểm xem; các phần vẫn mang ID và nguồn tháng/tuần/ngày.

Thông tin lớp/GVCN trong kế hoạch là bản chụp của chính tài liệu. Đổi hồ sơ lớp sau này không tự sửa các kế hoạch đã lưu. Kế hoạch tháng lưu danh sách GVCN; hồ sơ tài khoản toàn cục hiện chưa có biểu mẫu danh sách GVCN.

## 3. Bảy mã nhóm

| Mã | Nhãn |
| --- | --- |
| `don-tre-the-duc` | Đón trẻ, thể dục sáng |
| `tro-chuyen` | Trò chuyện |
| `hoc` | Hoạt động học |
| `ngoai-troi` | Hoạt động ngoài trời |
| `choi-goc` | Hoạt động chơi góc |
| `an-ngu-ve-sinh` | Hoạt động ăn, ngủ, vệ sinh |
| `chieu` | Hoạt động chiều |

Mỗi nhóm có UUID riêng tại mỗi cấp; mã nhóm xác định ý nghĩa, UUID xác định đúng ô nội dung. Không dùng nhãn hiển thị làm khóa dữ liệu.

## 4. Nội dung chung và ngoại lệ

Đọc lần lượt tháng → tuần → ngày:

| Trạng thái / cách áp dụng | Kết quả |
| --- | --- |
| `chua-nhap` | Không bổ sung nội dung; giữ kết quả từ cấp trước, nếu không có thì vẫn chưa nhập |
| `co-noi-dung` + `bo-sung` | Giữ phần chung trước đó và thêm các phần tại cấp này |
| `co-noi-dung` + `thay-the` | Chỉ lấy các phần tại cấp này |
| `khong-ap-dung` | Xóa kết quả chung trong phạm vi này và đánh dấu không áp dụng |

Cấp cụ thể hơn có thể ghi ngoại lệ cho cấp trước, kể cả khi cấp trước đã đánh dấu không áp dụng. Thứ tự phần trong cùng cấp được lưu đúng như giáo viên sắp xếp.

Ví dụ: nhập đón trẻ ở tháng, bài tập thể dục cho từng tuần ở cấp tuần và chọn **Bổ sung**. Kết quả mỗi ngày chứa cả đón trẻ chung và thể dục của tuần, không cần nhập lại phần đón trẻ. Nếu chỉ tuần 1 và 3 dùng cùng bài tập, nhập phần ở đúng hai tuần này; đợt sau có thể bổ sung thao tác áp dụng nhiều tuần.

Nhóm ăn/ngủ/vệ sinh có sẵn nhưng ban đầu `chua-nhap`, `phan: []`. Không suy ra “không áp dụng”, không tạo nội dung AI để lấp trống. Một nhóm đã chọn nhập riêng cần ít nhất một phần có nội dung; phần trống phải được nhập hoặc bỏ trước khi lưu.

## 5. Ngày lịch và định danh

- Tháng/năm và khoảng ngày do giáo viên chọn; không thay bằng tuần hiện tại khi mở/lưu.
- Ngày lưu dạng ngày lịch `YYYY-MM-DD`; tính lịch bằng UTC để không bị đổi ngày theo múi giờ. Tên thứ được suy ra từ ngày, không lưu hai trường có thể mâu thuẫn.
- Phạm vi kế hoạch nằm trong cùng tháng. Tuần gom theo Thứ Hai–Chủ nhật; mỗi tuần có 1–7 ngày học đã chọn. Ngày nghỉ là ngày không được chọn, không phải nhóm hoạt động “không áp dụng”.
- Khoảng tuần khớp ngày học đầu/cuối của tuần; danh sách tuần/ngày tăng dần và không trùng. Cho phép chọn ngày không liên tiếp và tuần đầu/cuối không đủ năm ngày.
- Mọi tài liệu, tuần, ngày, nhóm, phần có UUID ổn định. Đổi nội dung không đổi ID. Chỉnh lịch giữ ID của các tuần/ngày còn lại; ngày thêm mới nhận ID mới. Giao diện xác nhận trước khi bỏ ngày và khối chung của tuần không còn ngày học.
- Nhân bản tạo ID mới toàn bộ cây và bỏ `giaoAnId`, giữ ngày và nội dung. Bản sao không mặc định là kế hoạch của tháng tiếp theo.
- Xóa giáo án bỏ liên kết ở cả kế hoạch tuần cũ và các phần trong kế hoạch tháng, giữ nguyên nội dung hoạt động.

## 6. Kiểm tra và lưu

`docKeHoachThang` dùng chung khi mở tài liệu, trước khi lưu demo và tại `POST /api/documents` (cả chế độ demo và tài khoản). Kiểm tra phiên bản, ID duy nhất, ngày thực, phạm vi/tuần/ngày, độ tuổi, đủ bảy nhóm không trùng, trạng thái và nội dung phần. Giới hạn 6 tuần, 7 ngày mỗi tuần, 50 phần mỗi nhóm, 20.000 ký tự nội dung mỗi phần; API vẫn giới hạn tổng JSON 1 MB.

Dữ liệu lỗi/phiên bản chưa hỗ trợ được báo lỗi khi mở, không tự sửa hay âm thầm bỏ bớt nội dung. Lỗi ghi API/localStorage không hiển thị thành công; giữ bản đang nhập và cho lưu lại. Nút lưu khóa chỉnh sửa trong lúc ghi; trang cảnh báo trình duyệt khi tải lại/đóng với thay đổi chưa lưu. Nội dung chưa bấm lưu không phải bản lưu bền vững; điều hướng trong app cần lưu trước.

Kế hoạch tuần cũ, cache tuần, prompt AI tuần và các file xuất tuần giữ định dạng cũ. Không có chuyển đổi cưỡng bức tài liệu cũ sang tháng. Muốn chia sẻ dữ liệu từ tháng sang luồng soạn giáo án hiện tại cần bổ sung tham chiếu ở đợt tiếp theo.

## 7. Database

- Database mới: chạy `supabase/schema.sql`.
- Database đã có: chạy `supabase/migrations/20261014_ke_hoach_thang.sql` một lần. Chỉ mở rộng constraint `documents_loai_check`, không xóa hay sửa nội dung cũ, không thay RLS.
- Migration chưa được thực thi lên Supabase từ workspace này. Demo dùng localStorage không cần migration.

## 8. Đối chiếu cấu trúc mẫu tháng 10

Khung 05–30/10/2026 với T2–T6 biểu diễn được bốn tuần và 20 ngày; không tự thêm 01–02/10. Mỗi tuần có chủ đề riêng. Bốn nhóm chia ngày trong mẫu có thể chứa 80 ô nội dung; các khối chơi góc lưu theo tuần, đón trẻ/thể dục theo tháng và tuần. Mỗi ô hỗ trợ nhiều phần riêng, nội dung nhiều dòng, thứ tự giữ nguyên. Hàng ăn/ngủ/vệ sinh vẫn có thể chưa nhập.

Đây là khả năng của mô hình và biểu mẫu, chưa phải dữ liệu mẫu đã được nhập hay kết quả đối chiếu bằng kiểm thử. Đợt này đã chạy `npm run check:types`; chưa chạy kiểm thử tự động hoặc kiểm tra trình duyệt.

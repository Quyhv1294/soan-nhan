# Phân tích mẫu kế hoạch giáo dục tháng 10 và đề xuất thay đổi Soạn Nhàn

Ngày phân tích: 14/10/2026.

Cập nhật triển khai: đã bổ sung [đợt 1 — nền dữ liệu tháng/tuần/ngày](nen-du-lieu-ke-hoach-thang.md), [đợt 2 — bộ MT, loại tiết, từng ô và liên kết giáo án](muc-tieu-bieu-mau-lien-ket-giao-an.md) và [đợt 3 — bảng tháng, Word/PDF theo mẫu](bang-thang-va-xuat-tai-lieu.md). Phần phân tích dưới đây ghi nhận hiện trạng trước các đợt triển khai này.

Nguồn: `C:/Users/Quy/Desktop/kehoachgiaoduc-1791170229437.doc` do người dùng cung cấp. Phân tích nội dung và cấu trúc HTML/Word tại máy, không gửi tài liệu đến dịch vụ AI hay dịch vụ chuyển đổi bên ngoài. Tài liệu gốc được giữ nguyên. Báo cáo này đề xuất thay đổi; chưa thay đổi mã chức năng của app.

## 1. Kết luận chính

File là **kế hoạch giáo dục tháng cho lớp mẫu giáo lớn 5–6 tuổi**, không chứa tiến trình giáo án chi tiết của từng tiết. Có bốn tuần, bảy nhóm hoạt động, mục tiêu thực hiện, đánh giá và khu vực phê duyệt.

Để phù hợp, app cần bổ sung luồng **Hồ sơ lớp → Kế hoạch tháng → Kế hoạch tuần/ngày → Hoạt động → Giáo án chi tiết**, cùng danh mục mục tiêu dùng xuyên suốt. Chỉ chỉnh font hoặc bảng trong file xuất hiện tại sẽ không giải quyết được sự khác biệt về dữ liệu.

Mẫu này chưa đủ để quyết định giáo án chi tiết phải dùng bảng hai cột, ba cột hay văn bản tự do. Vì vậy nên giữ trình soạn giáo án hiện tại, bổ sung ngữ cảnh từ kế hoạch; quyết định mẫu tiến trình sau khi có một giáo án tiết học thực tế của lớp.

## 2. Những gì thực sự có trong file

### 2.1. Phạm vi thời gian và thông tin lớp

- Tháng 10; lớp mẫu giáo lớn 5–6 tuổi; có tên lớp và hai giáo viên chủ nhiệm.
- Bốn cột tuần: 05–09/10, 12–16/10, 19–23/10, 26–30/10.
- Phần phê duyệt hiển thị ngày 05/10/2026. Các khoảng ngày trên khớp Thứ Hai–Thứ Sáu trong năm 2026.
- Chủ đề/sự kiện riêng từng tuần:

| Tuần theo tiêu đề bảng | Khoảng ngày | Chủ đề/sự kiện |
| --- | --- | --- |
| 1 | 05–09/10 | Cơ thể của bé |
| 2 | 12–16/10 | Bé cần gì để lớn lên và khỏe mạnh |
| 3 | 19–23/10 | Ngày phụ nữ Việt Nam 20/10 |
| 4 | 26–30/10 | Ước mơ của bé |

Ngày 01–02/10 không xuất hiện trong phạm vi bảng. Cần xác nhận phạm vi lập kế hoạch của lớp; không tự kết luận thiếu dữ liệu hoặc tự thêm hoạt động cho hai ngày này.

### 2.2. Bảy nhóm hoạt động và ba cấp nội dung

| Nhóm hoạt động | Cách tổ chức trong mẫu | Nhu cầu dữ liệu |
| --- | --- | --- |
| Đón trẻ, thể dục sáng | Nội dung chung gộp ngang bốn tuần; bài tập chia tuần 1+3 và 2+4 | Khối chung theo tháng và lịch áp dụng theo tuần |
| Trò chuyện | T2–T6, nội dung riêng cho từng tuần | Hoạt động theo ngày; nhiều ý như chào hỏi, chia sẻ, hoạt động nhóm, thông điệp sáng |
| Hoạt động học | T2–T6, mỗi ô có loại hoạt động và đề tài | Tách loại tiết, tên đề tài, nội dung chính/kết hợp, trạng thái học và mục tiêu |
| Hoạt động ngoài trời | T2–T6, nhiều nội dung trong cùng ô | HĐ có chủ đích, trò chơi vận động, chơi tự do; cho phép sự kiện/giao lưu thay thế |
| Hoạt động chơi góc | Một khối dài cho từng tuần, không chia thành năm ô ngày | Góc trọng tâm, chuẩn bị, kỹ năng, các góc khác và mục tiêu |
| Hoạt động ăn, ngủ, vệ sinh | Có hàng nhưng chưa có nội dung | Phân biệt khối chưa nhập với khối được xác nhận không áp dụng |
| Hoạt động chiều | T2–T6, mỗi ô có thể có nhiều nội dung | Trò chơi, bài tập, kỹ năng, ôn tập, hoạt động tập thể và tham chiếu tài liệu |

**Ba cấp cần phân biệt:** dùng chung cả tháng, dùng chung trong một tuần, và riêng từng ngày. Không nên lưu mọi nội dung thành một chuỗi tên hoạt động ngắn hoặc lặp bản sao ở tất cả các ngày.

### 2.3. Hoạt động học có cấu trúc chuyên môn

Mẫu sử dụng các loại tiết: làm quen chữ viết, văn học, làm quen với toán, khám phá, vận động, âm nhạc và tạo hình. Đây là phân loại cụ thể hơn năm lĩnh vực phát triển hiện tại.

Ví dụ:

- Toán có đề tài, tiết hoặc mức độ: quy tắc A–BB, tách nhóm có 7 đối tượng, ôn phạm vi 7.
- Văn học có tên tác phẩm và ghi chú “Trẻ chưa biết”.
- Vận động tách **VĐCB** và **TCVĐ**.
- Âm nhạc tách **NDTT**, **NDKH**; có dạy hát, vận động minh họa, nghe hát và trò chơi.
- Có nội dung STEAM và Montessori ở các nhóm hoạt động khác nhau.

Nên cho chọn loại tiết để biểu mẫu mở đúng trường. Giữ cả lĩnh vực phát triển và loại tiết; không dùng một trường thay cho trường kia. Một hoạt động cũng có thể tích hợp nhiều lĩnh vực hoặc mục tiêu.

### 2.4. Mục tiêu thực hiện

Có **11 mã MT khác nhau**:

| Nhóm | Mã mục tiêu được liệt kê ở cột mục tiêu |
| --- | --- |
| Trò chuyện | MT40, MT43 |
| Hoạt động học | MT95, MT66 |
| Chơi góc | MT9, MT8 |
| Hoạt động chiều | MT22, MT49, MT16, MT65, MT38 |

Mỗi mã đi kèm mô tả; một số có thêm số thứ tự/chỉ tiêu như `MT40.1.1`, `MT95.3.2`. Mã cũng xuất hiện trực tiếp tại các hoạt động trong bảng.

Các mã này phải thuộc **bộ mục tiêu do trường/lớp cung cấp**, có phiên bản và độ tuổi. Không suy ra đây là một danh mục mã quốc gia thống nhất, và không để AI tự tạo ý nghĩa cho mã chưa có trong bộ đã chọn.

App nên lưu liên kết mục tiêu bằng ID; phần hiển thị và file xuất lấy mã/mô tả từ cùng một bản chụp danh mục. Cần phân biệt **mục tiêu dự kiến thực hiện** với **kết quả đánh giá đã thực hiện**, vì file là kế hoạch và chưa có kết quả điền cụ thể.

### 2.5. Đánh giá và phê duyệt

- Có khu vực đánh giá của giáo viên và đánh giá của ban giám hiệu, đang để trống.
- Có ba vai trò: Ban giám hiệu, Khối trưởng, Giáo viên.
- Có ngày và nhãn “Đã ký số” cùng hình ảnh nhỏ trong phần ký.

Những dấu hiệu hiển thị này không đủ để xác minh chữ ký số. App có thể bổ sung trạng thái nháp/chờ duyệt/cần chỉnh sửa/đã duyệt và lịch sử phiên bản. Chỉ triển khai chữ ký số thực sự khi có dịch vụ ký/xác minh; không tự sinh nhãn “Đã ký số” cho file mới.

### 2.6. Định dạng tài liệu

- Đuôi `.doc`, nhưng nội dung thực tế là **HTML tương thích Word**, mã hóa UTF-8; không phải DOC nhị phân.
- Bảng chính có 26 hàng vật lý, với ô gộp ngang và dọc. Khi bung ô gộp, có bảy cột logic: nhóm hoạt động, thứ, bốn tuần, mục tiêu.
- Các nhóm trò chuyện, học, ngoài trời và chiều đều có năm hàng T2–T6. Chơi góc là khối theo tuần; đón trẻ/thể dục sáng là khối theo tháng.
- Times New Roman; phần nội dung đọc được chủ yếu đặt 14pt, xen một số đoạn 13pt/12pt. Không nên suy ra cỡ chữ thực tế chỉ từ style mặc định 13pt của file.
- Khai báo trang là **792 × 612pt, Letter ngang**; lề trên/dưới xấp xỉ 2cm, trái 3cm, phải 1,5cm. Không mặc định khẳng định đây là A4.
- Các chiều rộng khai báo ở hàng tiêu đề là 16%, bốn cột 18% và cột mục tiêu 9%, tổng 97%. Nên chuẩn hóa chiều rộng theo vùng in khi tái tạo, không sao chép mù quáng tất cả thông số HTML cũ.

Chưa dựng tài liệu bằng Microsoft Word để xác nhận chính xác số trang và các điểm ngắt trang của bản gốc.

## 3. Các điểm cần xác nhận khi nhập mẫu

1. **Cách đánh số tuần ở hàng chơi góc:** nội dung lần lượt ghi Tuần 2, Tuần 4, Tuần 3, Tuần 5, trong khi tiêu đề cột là 1–4. Cần xác nhận là cách đánh số khác hay nội dung sao chép chưa sửa; không tự dịch chuyển các ô.
2. **Phạm vi đầu tháng:** chưa có ngày 01–02/10. Cho giáo viên chọn tuần thuộc tháng hoặc giữ đúng phạm vi nhập.
3. **Khối ăn–ngủ–vệ sinh trống:** đánh dấu cần bổ sung/xác nhận, không tự lấp bằng nội dung AI trong lúc nhập.
4. **Nội dung lặp:** ví dụ bài hát “Mời bạn ăn” xuất hiện ở tuần 2 và 4. Có thể là kế hoạch ôn/lặp có chủ đích; cảnh báo mềm, cho đánh dấu ôn luyện.
5. **Một số mục con trống hoặc lỗi gõ:** có đoạn “Chia sẻ:” chưa có nội dung và lỗi chính tả. Hiển thị bản gốc bên cạnh đề xuất sửa; giữ tên tác phẩm và thuật ngữ để giáo viên duyệt.
6. **Thông tin cá nhân trong ghi chú chăm sóc:** bản mẫu có thông tin nhận diện trẻ và tình trạng sức khỏe. Khi dùng làm mẫu AI hoặc tài liệu chia sẻ, cần loại bỏ thông tin nhận diện; không đưa nguyên ghi chú này vào kho ví dụ chung. Không chép chi tiết nhận diện vào báo cáo này.
7. **Thời điểm hoạt động gắn sự kiện:** “Trang trí bưu thiếp ngày 20/10” nằm ở T6 tuần 19–23/10, tức ngày 23/10 nếu dùng năm 2026. Nếu mục đích là chuẩn bị quà trước lễ thì cần đổi lịch; nếu là hoạt động mở rộng sau lễ thì có thể giữ. App nên cảnh báo ngày để giáo viên quyết định, không tự chuyển lịch.

## 4. Đối chiếu app hiện tại và thay đổi cần làm

| Hạng mục | Hiện tại | Đề xuất |
| --- | --- | --- |
| Đơn vị kế hoạch | Chỉ có kế hoạch tuần | Thêm kế hoạch tháng, liên kết tuần/ngày/giáo án |
| Thời gian | Tạo tuần bằng Thứ Hai gần nhất; biểu mẫu chưa chọn tuần rõ ràng | Chọn năm học, tháng, khoảng ngày; hỗ trợ tuần giao tháng và ngày nghỉ |
| Nhóm hoạt động | Năm buổi cố định | Cấu hình theo mẫu trường, tối thiểu đủ bảy nhóm của file |
| Nội dung một ô | `ten: string`, prompt yêu cầu một dòng | Nội dung nhiều ý, phần con theo loại; giữ chung/tuần/ngày riêng |
| Phân loại tiết | Chỉ năm lĩnh vực phát triển | Bổ sung loại tiết và mẫu trường tương ứng |
| Mục tiêu | Chưa có mã và quan hệ mục tiêu–hoạt động | Danh mục mục tiêu, chọn/gắn MT, tổng hợp mức bao phủ theo tháng |
| Thông tin lớp | Một tên lớp; chưa có danh sách GVCN cho tài liệu | Thêm nhiều GVCN, năm học; tên trường/tổ khối tùy chọn |
| Đánh giá | Chủ yếu trạng thái đã soạn, chưa có kết quả thực hiện | Đánh giá tuần/tháng và nội dung điều chỉnh, gắn phiên bản kế hoạch |
| Phê duyệt | Chưa có | Bắt đầu bằng trạng thái, người duyệt, ngày duyệt, ý kiến; ký số là tích hợp riêng |
| Xuất Word/PDF | Giáo án 3 cột hoặc lưới tuần; Word mặc định 13pt, bảng tuần 11pt | Mẫu tháng riêng có ô gộp, cột MT, đánh giá, ký; tùy chọn A4/Letter ngang |

### Các vị trí mã chịu ảnh hưởng

- `src/lib/types.ts`: thêm mô hình tháng, mục tiêu, nhóm hoạt động và loại tiết; bổ sung metadata và liên kết ổn định.
- `src/lib/prompts.ts`: thay quy tắc cố định năm buổi/một dòng; bỏ ép năm lĩnh vực mỗi lĩnh vực đúng một ngày; nhận mục tiêu, tài liệu và lịch giáo viên đã chọn.
- `src/lib/ai-schemas.ts`: schema theo loại hoạt động, kiểm tra mã mục tiêu, ngày, phần con và quan hệ liên kết. Bộ năm buổi cố định hiện tại không biểu diễn đủ file.
- `src/lib/generate-ai.ts`: nhận khoảng thời gian thực tế thay vì tự chọn tuần gần nhất; bổ sung soạn tháng/tuần/ô theo ngữ cảnh đã duyệt.
- `src/app/(app)/ke-hoach-tuan/KeHoachTuanView.tsx`: chuyển nhóm cố định thành cấu hình theo mẫu, sửa từng ô/khối dùng chung; giữ chế độ kế hoạch nhanh cũ.
- `src/app/(app)/giao-an/moi/GiaoAnEditor.tsx` và `src/components/NoiDungBaiDayEditor.tsx`: nhận loại tiết, MT, trạng thái trẻ đã biết/chưa biết, chuẩn bị và phần nội dung từ hoạt động gốc.
- `src/lib/export-docx.ts`, `src/lib/export-pdf.ts`: thêm bộ dựng kế hoạch tháng; cấu hình trang, font, gộp ô, lặp tiêu đề và ngắt trang phù hợp nội dung dài.
- `src/app/api/documents/route.ts`, `src/lib/kho-local.ts`, thư viện và `supabase/schema.sql`: cho phép loại `ke-hoach-thang`, lưu/đọc liên kết và phiên bản; cần migration cho dữ liệu đã có.
- Tin nhắn, phiếu và trò chơi: nhận ngữ cảnh từ tuần/ngày được chọn; phiếu chữ cái, toán, quà 20/10 có thể lấy đúng đề tài thay vì chỉ chủ đề chung.

Riêng phiếu học tập, năm mẫu SVG hiện tại mới chủ yếu theo chủ đề và ghi chú; chưa biểu diễn đầy đủ yêu cầu chữ a–ă–â/e–ê, quy tắc A–BB hoặc tách nhóm 7 đối tượng trong file. Nên bổ sung tham số học tập như nhóm chữ, phạm vi số, quy tắc và mức độ; không chỉ đổi hình minh họa rồi coi là đã bám kế hoạch.

## 5. Trải nghiệm sử dụng đề xuất

### Máy tính

1. Chọn lớp, năm/tháng và mẫu kế hoạch của trường.
2. Chọn hoặc nhập bộ mục tiêu và chủ đề/sự kiện từng tuần.
3. Bảng tháng bố trí gần file: cột trái cố định nhóm hoạt động/thứ; các cột tuần; cột mục tiêu. Có chế độ mở riêng một tuần để chỉnh chi tiết.
4. Bấm một ô để mở vùng chỉnh: loại hoạt động, các phần nội dung, tài liệu tham chiếu, MT và nút soạn giáo án liên kết.
5. Khối chung có lựa chọn “Cả tháng”, “Tuần đã chọn”, “Ngày đã chọn”. Cho sửa ngoại lệ, tránh tạo nhiều bản sao không đồng bộ.
6. Có nút khóa nội dung đã duyệt và chỉ soạn lại phần đang chọn; so sánh thay đổi trước khi áp dụng.
7. Một nút chính theo ngữ cảnh; xuất tháng, xuất tuần và tài liệu phụ trong menu tùy chọn.

### Điện thoại

Hiển thị danh sách tuần → ngày → thẻ nhóm hoạt động, không ép bảng bảy cột vào màn hình nhỏ. Mục tiêu hiển thị bằng thẻ mã, mở mô tả khi bấm. Bản in vẫn dùng bố cục tháng của trường.

## 6. Cách dùng AI cần thay đổi

### 6.1. Ràng buộc nội dung theo kế hoạch đã duyệt

Đầu vào soạn giáo án nên mang: lớp/độ tuổi, tháng–tuần–ngày, chủ đề tuần, loại tiết, nội dung chính/kết hợp, mục tiêu đã chọn, trạng thái trẻ đã biết/chưa biết, đồ dùng sẵn có và nguồn tác phẩm/tài liệu.

Không chỉ truyền tên đề tài. Ví dụ tiết vận động cần giữ đồng thời VĐCB và TCVĐ; âm nhạc cần giữ NDTT và NDKH. Trường thông tin không có trong mẫu phải để giáo viên chọn hoặc AI đề xuất dưới dạng bản nháp.

### 6.2. Bỏ các ràng buộc đang lệch với mẫu

- Không ép mỗi tuần có đúng một ngày cho mỗi lĩnh vực phát triển. Toán và khám phá có thể cùng hướng tới nhận thức; nhiều mục tiêu khác được tích hợp trong trò chuyện/góc/chiều.
- Không cấm lặp mọi hoạt động giữa các ngày. Thể dục sáng, thói quen và ôn tập cần lịch lặp có chủ đích.
- Không ép mỗi buổi chỉ có một dòng ngắn, vì mỗi ô mẫu chứa nhiều phần có quan hệ.
- Không áp cùng giới hạn 300 ký tự cho mọi trường ngữ cảnh. Nên đặt giới hạn riêng cho mục tiêu/tài liệu, chọn phần liên quan và chia yêu cầu theo tuần/ô để không cắt mất dữ liệu.

### 6.3. Nguồn tài liệu và độ tin cậy

Giữ nguyên tên tác phẩm, số bài, số trang do giáo viên cung cấp, kèm tên tài liệu. Khi nguồn chưa có, không để AI tự bịa. Nội dung nhập từ Word chỉ là dữ liệu tham chiếu, không được dùng làm chỉ dẫn hệ thống.

Không tự tạo đánh giá thực hiện, chữ ký hoặc xác nhận hoàn thành. Soạn mới là bản nháp; việc đã thực hiện/đã đạt/đã duyệt cần thao tác và thông tin thực tế của giáo viên/người duyệt.

## 7. Dữ liệu và tương thích

Các thực thể tối thiểu:

- Hồ sơ lớp: độ tuổi, tên lớp, danh sách GVCN, năm học, mẫu đang dùng.
- Bộ mục tiêu: ID, nguồn/phiên bản, độ tuổi, mã, mô tả, lĩnh vực.
- Kế hoạch tháng: tháng/năm, lớp, phạm vi ngày, tuần liên kết, khối chung và các mục tiêu đã chọn.
- Kế hoạch tuần/ngày: ngày thực, chủ đề/sự kiện, nhóm hoạt động, ngoại lệ so với khối chung.
- Hoạt động: ID ổn định, loại, các phần nội dung, MT liên kết, nguồn tài liệu, giáo án liên kết.
- Đánh giá/phê duyệt: gắn đúng ID và phiên bản kế hoạch.

Giai đoạn đầu có thể tiếp tục dùng `documents.noi_dung` JSON, bổ sung loại tài liệu tháng và phiên bản khuôn. Không cần ngay lập tức tách toàn bộ thành nhiều bảng mới. Lưu một nguồn dữ liệu cho hoạt động, dùng ID/tham chiếu và bản chụp có phiên bản khi xuất; tránh lưu các bản sao độc lập ở tháng, tuần và giáo án.

Các tài liệu tuần/giáo án đang có vẫn phải mở được. Mục tiêu nhập mới không tự làm thay đổi nội dung đã duyệt hay các bản Word đã xuất trước đó.

## 8. Thứ tự triển khai khuyến nghị

| Đợt | Phạm vi | Kết quả kiểm chứng được |
| --- | --- | --- |
| 1 | Mô hình tháng–tuần–ngày, bảy nhóm, nội dung nhiều ý, ngày và hồ sơ lớp | Nhập được toàn bộ cấu trúc mẫu mà không mất ô chung/ô tuần/ô ngày |
| 2 | Bộ MT, gắn mục tiêu, loại tiết và editor từng ô | Có đủ 11 mã từ mẫu; các phần VĐCB/TCVĐ, NDTT/NDKH giữ riêng; kiểm tra được ô chưa gắn MT |
| 3 | Xuất Word/PDF tháng theo mẫu và màn hình tháng/tuần | Có gộp ô, cột MT, đánh giá, chỗ ký; font/khổ giấy chọn rõ; nội dung dài không bị cắt |
| 4 | AI theo ngữ cảnh, khóa ô, nhập mẫu có xem trước, phê duyệt | Soạn lại một ô không đổi phần đã khóa; không mất liên kết; không bịa MT, kết quả hoặc ký số |

**Ưu tiên làm đợt 1–2 trước.** Khi dữ liệu và editor phản ánh đúng kế hoạch của lớp, mới triển khai mẫu xuất và tinh chỉnh AI. Đối chiếu file gốc là tiêu chí nghiệm thu, không dùng mức giống giao diện làm tiêu chí duy nhất.

## 9. Tiêu chí nghiệm thu cho mẫu này

1. Giữ đúng bốn khoảng tuần và bốn chủ đề/sự kiện; không tự thay bằng tuần hiện tại.
2. Có đủ bảy nhóm, trong đó hàng ăn–ngủ–vệ sinh vẫn có trạng thái chưa nhập.
3. Không mất cấu trúc của 80 ô ngày/tuần trong bốn nhóm chia theo T2–T6; giữ riêng bốn khối chơi góc và khối đón trẻ/thể dục chung.
4. Có đủ 11 mã MT và mô tả; những chỗ chưa gắn cụ thể phải được đánh dấu để giáo viên xác nhận.
5. Không tự sửa số tuần hoặc loại nội dung lặp khi chưa được giáo viên duyệt.
6. Giữ được đề tài, số tiết, trạng thái trẻ, VĐCB/TCVĐ và NDTT/NDKH khi chuyển sang soạn giáo án.
7. Bản xuất giữ nội dung, bố cục bảng và chỗ đánh giá/phê duyệt; không tự gắn “Đã ký số”.
8. Không đưa thông tin nhận diện trẻ vào ví dụ AI hoặc bản mẫu chia sẻ.
9. Dữ liệu demo và tài liệu cũ tiếp tục mở được sau nâng cấp.

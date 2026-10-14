# Mở rộng phiếu học tập và trò chơi lớp học

## Tạo nội dung mới bằng AI

1. Nhập chủ đề, độ tuổi/lớp và yêu cầu thêm trong **Tạo nội dung mới bằng AI**. Độ tuổi điền theo hồ sơ, có thể chọn lại.
2. Mặc định **AI tự chọn dạng bài/kiểu trò chơi**. Khi cô chọn một mẫu trong danh mục, chế độ chuyển sang giữ mẫu đó; có thể bật tự chọn lại.
3. Với phiếu, mở **Chữ, số và quy luật trên phiếu** để chọn phạm vi 3–10, chữ mục tiêu (1–6 chữ) và quy luật AB/AAB/ABB. Thông số chỉ áp dụng cho dạng bài tương ứng. Với trò chơi, chọn 3–10 câu/cặp/bước.
4. Bấm **Tạo bằng AI**; kết quả chưa tự lưu. Phiếu có **Chỉnh sửa bài tập AI** để sửa tiêu đề, hướng dẫn, hình, dữ kiện từng bài rồi **Áp dụng chỉnh sửa**. Trò chơi sửa trực tiếp các dòng câu hỏi/đáp án/bước.
5. Có **Tạo bộ khác bằng AI** và **Khôi phục nội dung trước** (một mức, trong lần mở trang hiện tại). Lỗi tạo giữ nội dung cũ; lỗi lưu không yêu cầu sinh lại. Chọn lại mẫu hoặc thông số phiếu đưa về dữ kiện mẫu để xem bố cục; có thể khôi phục phiếu AI trước đó.
6. Xem lại, bấm lưu vào thư viện hoặc in/trình chiếu. Khi mở lại, phiếu/PDF dùng bài tập đã lưu, không tự gọi AI và không thay bằng mẫu mặc định.

### Dữ liệu và dịch vụ

- `/api/generate` hỗ trợ `loai=phieu|tro-choi`, đi qua Gemini/schema/kiểm tra dữ liệu/thử lại như các chức năng AI hiện có. Yêu cầu mới được kiểm tra trước khi dùng lượt soạn. Giữ cơ chế đăng nhập, quota và giới hạn tần suất hiện có.
- Cần `AI_API_KEY` phía máy chủ, dùng cùng `AI_PROVIDER`, `AI_MODEL_FAST`, `AI_MODEL_STRONG`. Thiếu cấu hình trả 503 với thông báo, không trả bộ mẫu dưới nhãn AI. Không gửi khóa xuống trình duyệt.
- Mỗi lượt có mã biến thể mới; phần nội dung trước được cung cấp giới hạn 1.500 ký tự để tránh lặp, từ chối kết quả lặp hoàn toàn phần này. Đây không phải cam kết mọi câu chưa từng xuất hiện trong toàn bộ thư viện.
- Phiếu thêm trường JSON tùy chọn `baiTapAi: {tieuDe,huongDan,dong[]}` và độ tuổi, không cần migration. Bộ kiểm tra chỉ nhận các trường bài tập theo dạng, hình thuộc kho vector, đúng số dòng; kiểm tra lựa chọn đếm, phép tính trong phạm vi, tổng tách gộp, chữ mục tiêu, dãy cách đều và đúng 5 vị trí khác nhau. Không nhận HTML/SVG từ AI.
- Phiếu AI tạo dữ kiện, hướng dẫn và cách kết hợp hình, chưa sinh ảnh minh họa mới. Hai tranh tìm điểm khác của AI là hai bảng sáu vị trí hình, đúng năm vị trí thay đổi. Các bố cục mẫu cũ vẫn giữ nguyên khi chưa sinh AI.
- Trò chơi AI trả `mau,ten,noiDung`; kiểm tra bằng cùng parser dùng lúc nhập tay/chơi/lưu, đúng số dòng yêu cầu và định dạng đáp án. AI vẫn có thể sai kiến thức hoặc chọn mức độ chưa sát; cô cần đọc lại trước khi dùng. Chưa gọi mô hình lần hai để chấm độc lập đáp án kiến thức.

## Phiếu: 5 → 12 mẫu

| Nhóm | Mẫu | Tùy chỉnh |
| --- | --- | --- |
| Quan sát & nét | Tô màu, nối hình, tìm 5 điểm khác, làm quen các nét | Chủ đề, ghi chú |
| Chữ cái | Tìm chữ, tô nét viền chữ | Chọn 1–6 chữ cái tiếng Việt viết thường |
| Toán | Đếm/khoanh, điền chữ/số, quy luật, so sánh, tách/gộp, cộng/trừ | Phạm vi 3–10 cho đếm/so sánh/tách-gộp/cộng-trừ; AB/AAB/ABB cho quy luật |

- Chữ mặc định a/ă/â/e/ê, tổng tách/gộp mặc định 7, quy luật mặc định ABB để thuận tiện với nội dung mẫu tháng 10. Đây là gợi ý, cô chọn lại theo khả năng của lớp.
- Danh mục có tìm kiếm không dấu và lọc nhóm; lọc không thay đổi mẫu đã chọn. Độ tuổi/lớp trên thẻ là gợi ý sử dụng.
- Bản xem, xem lớn, in và PDF dùng chung `renderPhieuSvg` trong `src/lib/phieu.ts`. Hình là vector nét viền, phần trả lời để trống. Phiếu chữ không có đáp án khoanh sẵn. Phiếu cộng/trừ dùng nhóm hình; gạch chéo biểu diễn phần bớt đi.
- Tô chữ dùng nét viền của phông chữ, không phải mẫu chữ tập viết có thứ tự nét hay ô ly chuẩn. Cô cần hướng dẫn cách đưa bút. Bài nối tên hình phù hợp khi cô đọc cùng trẻ chưa biết đọc.
- Chủ đề chọn một trong các nhóm hình sẵn có: hình học, gia đình, thiên nhiên, động vật, giao thông. Chưa sinh tranh mới theo mọi chủ đề hoặc ghi chú tự do.
- `PhieuHocTap.tuyChinh` và `baiTapAi` là trường JSON tùy chọn; phiếu cũ vẫn mở được và giữ bố cục cũ khi chưa thay thông số. Ghi chú/chủ đề/tùy chỉnh/bài tập AI được kiểm tra ở màn hình, lưu local và API. Không cần migration SQL.

## Trò chơi: 3 → 7 mẫu

| Mẫu | Cách nhập | Khi chơi |
| --- | --- | --- |
| Vòng quay gọi tên | Mỗi dòng một tên/nhiệm vụ; 2–40 dòng | Chọn ngẫu nhiên, có thể chọn lại cùng mục |
| Lật thẻ ghép đôi | `Thẻ thứ nhất \| Thẻ thứ hai`; 2–12 cặp | Xáo thẻ, ghi nhận cặp đúng; thẻ sai tự úp sau một khoảng ngắn |
| Ai nhanh hơn | `Câu hỏi \| Đáp án`; 1–20 câu | Cô mời trả lời rồi bấm hiện/ẩn đáp án gợi ý |
| Chọn đáp án đúng | `Câu hỏi \| *Đúng \| Khác`; 2–4 lựa chọn, 1–20 câu | Một lần chọn mỗi câu, phản hồi đúng/sai, tổng kết điểm |
| Đúng hay sai? | `Nhận định \| đúng` hoặc `Nhận định \| sai`; 1–20 câu | Chọn đúng/sai, phản hồi, tổng kết điểm |
| Ô cửa bí mật | `Câu hỏi \| Đáp án`; 1–12 ô | Chọn ô số, hiện gợi ý, hoàn thành ô để trở lại bảng |
| Sắp xếp thứ tự | 3–10 bước, nhập theo thứ tự đúng | Xáo thẻ, chọn từng bước, bỏ bước cuối, kiểm tra và xem thứ tự đúng |

- Có ba bộ chủ đề có sẵn cho cả bảy mẫu: **Bản thân & thói quen**, **Số & hình**, **Chữ cái**, tổng cộng 21 bộ nội dung có thể sửa; chọn bộ có sẵn không gọi AI. Trang mới ưu tiên nút tạo AI, không tự điền bộ cố định.
- Chọn chủ đề rồi bấm **Dùng nội dung mẫu** để thay nội dung của mẫu đang chọn. Đổi chủ đề không tự ghi đè phần cô đã nhập. Chuyển mẫu và quay lại giữ bản đang sửa trong lần mở trang hiện tại; chỉ mẫu được chọn được lưu vào tài liệu.
- Có tên trò chơi riêng; lưu lần tiếp theo cập nhật cùng ID. Mở lại từ thư viện đọc mẫu và nội dung đã lưu, kể cả định dạng cặp gạch ngang cũ. Tên đổi từ thư viện được hệ thống giữ như trước.
- Parser `src/lib/tro-choi.ts` kiểm tra mọi dòng, giới hạn số câu/ký tự, lựa chọn đúng duy nhất, các bước phân biệt được. Không bỏ qua dòng sai hoặc thay bằng nội dung demo khi cô nhập thiếu.
- Trình chiếu bằng hộp thoại toàn cửa sổ, có khóa cuộn nền, bàn phím, Esc để thoát, trả focus về nút mở. **Chơi lại** xóa tiến trình và xáo lại thẻ. Có thể dùng F11 của trình duyệt để ẩn thanh công cụ.
- Cô thao tác hoặc hướng dẫn trẻ chơi chung trên màn hình. Chưa có nhiều thiết bị tham gia, bảng xếp hạng cá nhân, tài khoản trẻ, lưu điểm sau khi đóng hoặc chấm câu trả lời nói bằng AI.

## Tình trạng kiểm tra

- Đã chạy kiểm tra biên dịch TypeScript (`npm run check:types`).
- Cập nhật danh sách bố cục kỳ vọng trong bài kiểm tra phiếu có sẵn theo 12 mẫu; chưa chạy bộ kiểm tra.
- Chưa gọi AI thật, kiểm tra trực tiếp trình duyệt, bản in/PDF AI, các lượt chơi hoặc lưu/mở lại trên Supabase trong lần thay đổi này. Các bộ kiểm tra trình duyệt cũ vẫn chỉ bao phủ năm phiếu ban đầu; chưa bao phủ luồng AI mới.

// Dữ liệu mẫu để dựng giao diện trước khi nối AI và Supabase.
// Khi nối thật, thay các hằng số này bằng dữ liệu từ /api/generate và bảng documents.

import type { GiaoAnMamNon, KeHoachBaiDay, KeHoachTuan, TaiLieu } from "./types";

export const MOCK_TUAN: KeHoachTuan = {
  id: "tuan-gia-dinh",
  chuDe: "Gia đình bé",
  nhanh: "Ngôi nhà của bé",
  doTuoi: "4-5",
  tuNgay: "2026-10-19",
  ngay: [
    {
      thu: "Thứ 2",
      hoatDong: [
        { id: "t2-don", buoi: "Đón trẻ", ten: "Trò chuyện về các thành viên trong gia đình" },
        { id: "t2-hoc", buoi: "Hoạt động học", ten: "Nhận biết hình tròn, hình vuông qua đồ dùng trong nhà", linhVuc: "Phát triển nhận thức", giaoAnId: "ga-hinh" },
        { id: "t2-ngoai", buoi: "Hoạt động ngoài trời", ten: "Quan sát ngôi nhà quanh trường; chơi Về đúng nhà" },
        { id: "t2-goc", buoi: "Hoạt động góc", ten: "Góc xây dựng: xây ngôi nhà của bé" },
        { id: "t2-chieu", buoi: "Hoạt động chiều", ten: "Ôn hình tròn, hình vuông bằng trò chơi" },
      ],
    },
    {
      thu: "Thứ 3",
      hoatDong: [
        { id: "t3-don", buoi: "Đón trẻ", ten: "Xem ảnh gia đình bé mang đến lớp" },
        { id: "t3-hoc", buoi: "Hoạt động học", ten: "Bật xa 50 cm", linhVuc: "Phát triển thể chất" },
        { id: "t3-ngoai", buoi: "Hoạt động ngoài trời", ten: "Vẽ phấn ngôi nhà trên sân" },
        { id: "t3-goc", buoi: "Hoạt động góc", ten: "Góc phân vai: mẹ con, nấu ăn" },
        { id: "t3-chieu", buoi: "Hoạt động chiều", ten: "Rèn kỹ năng gấp khăn" },
      ],
    },
    {
      thu: "Thứ 4",
      hoatDong: [
        { id: "t4-don", buoi: "Đón trẻ", ten: "Bé kể về việc giúp đỡ bố mẹ" },
        { id: "t4-hoc", buoi: "Hoạt động học", ten: "Kể chuyện về gia đình", linhVuc: "Phát triển ngôn ngữ" },
        { id: "t4-ngoai", buoi: "Hoạt động ngoài trời", ten: "Chơi Mèo đuổi chuột" },
        { id: "t4-goc", buoi: "Hoạt động góc", ten: "Góc thư viện: xem tranh về gia đình" },
        { id: "t4-chieu", buoi: "Hoạt động chiều", ten: "Đọc đồng dao, ca dao về gia đình" },
      ],
    },
    {
      thu: "Thứ 5",
      hoatDong: [
        { id: "t5-don", buoi: "Đón trẻ", ten: "Nghe bài hát về gia đình" },
        { id: "t5-hoc", buoi: "Hoạt động học", ten: "Vẽ chân dung người thân", linhVuc: "Phát triển thẩm mỹ" },
        { id: "t5-ngoai", buoi: "Hoạt động ngoài trời", ten: "Nhặt lá làm tranh gia đình" },
        { id: "t5-goc", buoi: "Hoạt động góc", ten: "Góc nghệ thuật: tô màu ngôi nhà" },
        { id: "t5-chieu", buoi: "Hoạt động chiều", ten: "Biểu diễn văn nghệ cuối ngày" },
      ],
    },
    {
      thu: "Thứ 6",
      hoatDong: [
        { id: "t6-don", buoi: "Đón trẻ", ten: "Trò chuyện về ngày nghỉ cuối tuần" },
        { id: "t6-hoc", buoi: "Hoạt động học", ten: "Bé yêu thương, giúp đỡ người thân", linhVuc: "Phát triển tình cảm, kỹ năng xã hội" },
        { id: "t6-ngoai", buoi: "Hoạt động ngoài trời", ten: "Chơi tự do với đồ chơi ngoài trời" },
        { id: "t6-goc", buoi: "Hoạt động góc", ten: "Góc thiên nhiên: tưới cây" },
        { id: "t6-chieu", buoi: "Hoạt động chiều", ten: "Nêu gương bé ngoan cuối tuần" },
      ],
    },
  ],
};

export const MOCK_GIAO_AN: GiaoAnMamNon = {
  id: "ga-hinh",
  tenHoatDong: "Nhận biết hình tròn, hình vuông qua đồ dùng trong nhà",
  linhVuc: "Phát triển nhận thức",
  chuDe: "Gia đình bé",
  doTuoi: "4-5",
  thoiLuong: "25–30 phút",
  mucDich: {
    kienThuc: ["Trẻ gọi đúng tên hình tròn, hình vuông.", "Trẻ nhận ra đặc điểm: hình tròn lăn được, hình vuông có 4 cạnh bằng nhau."],
    kyNang: ["Trẻ chọn đúng hình theo yêu cầu của cô.", "Trẻ tìm được đồ dùng trong nhà có dạng hình tròn, hình vuông."],
    thaiDo: ["Trẻ hứng thú tham gia hoạt động, biết cất đồ dùng gọn gàng."],
  },
  chuanBi: {
    cuaCo: ["Mô hình ngôi nhà có đĩa, khăn vuông, đồng hồ, gối vuông", "Bài giảng trình chiếu, nhạc bài hát về gia đình"],
    cuaTre: ["Mỗi trẻ 1 rổ có 3 hình tròn, 3 hình vuông", "Lô tô đồ dùng gia đình"],
    diaDiem: "Trong lớp học, trẻ ngồi hình chữ U",
  },
  tienHanh: [
    {
      ten: "Hoạt động 1: Ổn định, gây hứng thú",
      buoc: [
        {
          thoiGian: "2–3 phút",
          hoatDongCo: ["Cô cùng trẻ hát bài về gia đình.", "Cô mời trẻ đến thăm ngôi nhà của bạn Thỏ."],
          hoatDongTre: ["Trẻ hát cùng cô.", "Trẻ đi theo cô đến mô hình ngôi nhà."],
        },
      ],
    },
    {
      ten: "Hoạt động 2: Nhận biết, phân biệt hình",
      buoc: [
        {
          thoiGian: "12–15 phút",
          hoatDongCo: [
            "Cô đưa chiếc đĩa: Đây là gì? Chiếc đĩa có dạng hình gì?",
            "Cô cho trẻ lấy hình tròn trong rổ, lăn thử và nhận xét.",
            "Tương tự với chiếc khăn vuông và hình vuông.",
            "Cô hỏi trẻ: Hình tròn và hình vuông khác nhau ở điểm nào?",
          ],
          hoatDongTre: [
            "Trẻ trả lời theo hiểu biết.",
            "Trẻ lấy hình, lăn thử, nói: hình tròn lăn được.",
            "Trẻ đếm cạnh hình vuông: 1, 2, 3, 4.",
            "Trẻ so sánh và trả lời.",
          ],
        },
      ],
    },
    {
      ten: "Hoạt động 3: Luyện tập qua trò chơi",
      buoc: [
        {
          thoiGian: "8–10 phút",
          hoatDongCo: ["Trò chơi Về đúng nhà: cô nói luật, cách chơi.", "Cô nhận xét kết quả từng lượt chơi."],
          hoatDongTre: ["Trẻ cầm lô tô, chạy về nhà có hình tương ứng.", "Trẻ cùng kiểm tra kết quả."],
        },
      ],
    },
    {
      ten: "Kết thúc",
      buoc: [
        {
          thoiGian: "1–2 phút",
          hoatDongCo: ["Cô nhận xét, khen ngợi trẻ, cho trẻ cất đồ dùng."],
          hoatDongTre: ["Trẻ cất đồ dùng vào đúng nơi quy định."],
        },
      ],
    },
  ],
};

export const MOCK_KHBD: KeHoachBaiDay = {
  id: "khbd-cong-co-nho",
  lop: 2,
  mon: "Toán",
  boSach: "Kết nối tri thức",
  tenBai: "Phép cộng có nhớ trong phạm vi 100",
  tiet: "Tiết 1",
  yeuCauCanDat: {
    nangLucDacThu: ["Thực hiện được phép cộng có nhớ số có hai chữ số với số có một chữ số.", "Vận dụng giải bài toán thực tế có một bước tính."],
    nangLucChung: ["Giao tiếp, hợp tác khi làm việc nhóm đôi."],
    phamChat: ["Chăm chỉ, cẩn thận khi tính toán."],
  },
  doDung: { giaoVien: ["Bộ que tính, bảng phụ, bài giảng trình chiếu"], hocSinh: ["Que tính, bảng con, vở bài tập"] },
  hoatDong: [
    {
      ten: "1. Khởi động",
      mucTieu: "Tạo hứng thú, ôn phép cộng không nhớ.",
      giaoVien: ["Tổ chức trò chơi Truyền điện với các phép cộng không nhớ."],
      hocSinh: ["Tham gia trò chơi, nêu kết quả nhanh."],
    },
    {
      ten: "2. Khám phá",
      mucTieu: "Hình thành cách cộng có nhớ.",
      giaoVien: ["Nêu tình huống, hướng dẫn tính bằng que tính.", "Hướng dẫn đặt tính rồi tính, nhấn mạnh bước nhớ 1."],
      hocSinh: ["Thao tác que tính theo nhóm đôi.", "Đặt tính trên bảng con, nêu cách tính."],
    },
    {
      ten: "3. Luyện tập",
      mucTieu: "Củng cố kỹ năng tính.",
      giaoVien: ["Giao bài tập 1, 2; theo dõi, hỗ trợ học sinh còn chậm."],
      hocSinh: ["Làm bài cá nhân, đổi vở kiểm tra chéo."],
    },
    {
      ten: "4. Vận dụng",
      mucTieu: "Áp dụng vào tình huống thực tế.",
      giaoVien: ["Nêu bài toán về số quả cam hai bạn hái được."],
      hocSinh: ["Phân tích đề, trình bày lời giải."],
    },
  ],
};

export const MOCK_THU_VIEN: TaiLieu[] = [
  { id: "ga-hinh", loai: "giao-an", tieuDe: "Nhận biết hình tròn, hình vuông", chuDe: "Gia đình bé", capNhat: "2026-10-12" },
  { id: "tuan-gia-dinh", loai: "ke-hoach-tuan", tieuDe: "Kế hoạch tuần: Ngôi nhà của bé", chuDe: "Gia đình bé", capNhat: "2026-10-12" },
  { id: "phieu-1", loai: "phieu", tieuDe: "Tô màu đồ dùng hình tròn", chuDe: "Gia đình bé", capNhat: "2026-10-11" },
  { id: "tc-1", loai: "tro-choi", tieuDe: "Lật thẻ: thành viên gia đình", chuDe: "Gia đình bé", capNhat: "2026-10-11" },
  { id: "khbd-cong-co-nho", loai: "khbd", tieuDe: "Toán 2: Phép cộng có nhớ trong phạm vi 100", chuDe: "Toán lớp 2", capNhat: "2026-10-09" },
  { id: "tn-1", loai: "tin-nhan", tieuDe: "Thông báo tuần chủ đề Gia đình bé", chuDe: "Gia đình bé", capNhat: "2026-10-09" },
];

export const MOCK_TIN_NHAN = `Kính gửi quý phụ huynh lớp Mẫu giáo nhỡ A2,

Tuần này (19/10 – 23/10), các con học chủ đề "Gia đình bé – Ngôi nhà của bé".

Phụ huynh vui lòng:
- Cho con mang 1 tấm ảnh gia đình đến lớp vào sáng thứ Ba.
- Gửi kèm 1 đồ dùng nhỏ có dạng hình tròn hoặc hình vuông (nắp hộp, khăn tay…).

Gợi ý chơi cùng con ở nhà:
- Cùng con tìm đồ vật hình tròn, hình vuông trong bếp.
- Hỏi con về việc con đã giúp bố mẹ trong ngày.

Cảm ơn quý phụ huynh đã đồng hành cùng lớp!`;

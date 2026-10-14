// Khuôn dữ liệu tài liệu dùng chung cho nhập tay, AI, lưu trữ và xuất file.

export type CapHoc = "mam-non" | "tieu-hoc";

export type DoTuoi = "nha-tre" | "3-4" | "4-5" | "5-6";

export const DO_TUOI_LABEL: Record<DoTuoi, string> = {
  "nha-tre": "Nhà trẻ (24–36 tháng)",
  "3-4": "Mẫu giáo bé (3–4 tuổi)",
  "4-5": "Mẫu giáo nhỡ (4–5 tuổi)",
  "5-6": "Mẫu giáo lớn (5–6 tuổi)",
};

export const LINH_VUC = [
  "Phát triển thể chất",
  "Phát triển nhận thức",
  "Phát triển ngôn ngữ",
  "Phát triển tình cảm, kỹ năng xã hội",
  "Phát triển thẩm mỹ",
] as const;
export type LinhVuc = (typeof LINH_VUC)[number];

export type HoSoLop = {
  capHoc: CapHoc;
  doTuoi?: DoTuoi;
  lop?: 1 | 2 | 3 | 4 | 5;
  boSach?: "Kết nối tri thức" | "Chân trời sáng tạo" | "Cánh Diều";
  tenTruong?: string;
};

// F2 — Kế hoạch tuần
export type HoatDongTrongNgay = {
  id: string;
  buoi: "Đón trẻ" | "Hoạt động học" | "Hoạt động ngoài trời" | "Hoạt động góc" | "Hoạt động chiều";
  ten: string;
  linhVuc?: LinhVuc;
  giaoAnId?: string;
};

export type KeHoachTuan = {
  id: string;
  chuDe: string;
  nhanh?: string;
  doTuoi: DoTuoi;
  tuNgay: string; // ISO
  ngay: { thu: "Thứ 2" | "Thứ 3" | "Thứ 4" | "Thứ 5" | "Thứ 6"; hoatDong: HoatDongTrongNgay[] }[];
};

// F3 — Giáo án mầm non (mẫu 3 cột)
export type BuocTienHanh = {
  thoiGian: string;
  hoatDongCo: string[];
  hoatDongTre: string[];
};

export type GiaoAnMamNon = {
  id: string;
  tenHoatDong: string;
  linhVuc: LinhVuc;
  chuDe: string;
  doTuoi: DoTuoi;
  thoiLuong: string;
  mucDich: { kienThuc: string[]; kyNang: string[]; thaiDo: string[] };
  chuanBi: { cuaCo: string[]; cuaTre: string[]; diaDiem?: string };
  tienHanh: { ten: string; buoc: BuocTienHanh[] }[];
  nguCanhKeHoach?: NguCanhGiaoAnThang;
};

// F4 — Kế hoạch bài dạy tiểu học (CV 2345)
export type KeHoachBaiDay = {
  id: string;
  lop: 1 | 2 | 3 | 4 | 5;
  mon: "Toán" | "Tiếng Việt";
  boSach: string;
  tenBai: string;
  tiet?: string;
  yeuCauCanDat: { nangLucDacThu: string[]; nangLucChung: string[]; phamChat: string[] };
  doDung: { giaoVien: string[]; hocSinh: string[] };
  hoatDong: { ten: string; mucTieu: string; giaoVien: string[]; hocSinh: string[] }[];
  dieuChinh?: string;
};

// F5 — Phiếu học tập
export type MauPhieu = "to-mau" | "noi-hinh" | "dem-khoanh" | "dien-chu-so" | "tim-diem-khac" | "to-net" | "tim-chu" | "to-chu" | "quy-luat" | "so-sanh" | "tach-gop" | "cong-tru";

// F6 — Trò chơi
export type MauTroChoi = "vong-quay" | "lat-the" | "ai-nhanh-hon" | "trac-nghiem" | "dung-sai" | "o-cua-bi-mat" | "sap-xep";

// Kế hoạch tháng là nguồn dữ liệu duy nhất của các tuần/ngày bên trong.
// Giữ KeHoachTuan ở trên để tài liệu tuần cũ không phải chuyển đổi khi mở.
export const NHOM_HOAT_DONG = [
  { id: "don-tre-the-duc", ten: "Đón trẻ, thể dục sáng" },
  { id: "tro-chuyen", ten: "Trò chuyện" },
  { id: "hoc", ten: "Hoạt động học" },
  { id: "ngoai-troi", ten: "Hoạt động ngoài trời" },
  { id: "choi-goc", ten: "Hoạt động chơi góc" },
  { id: "an-ngu-ve-sinh", ten: "Hoạt động ăn, ngủ, vệ sinh" },
  { id: "chieu", ten: "Hoạt động chiều" },
] as const;
export type NhomHoatDong = (typeof NHOM_HOAT_DONG)[number]["id"];
export type MucTieuGiaoDuc = { id: string; ma: string; chiTieu: string; moTa: string; linhVuc?: LinhVuc };
export type BoMucTieu = { id: string; ten: string; nguon: string; phienBan: string; doTuoi: DoTuoi; mucTieu: MucTieuGiaoDuc[] };
export type LoaiTiet = "van-hoc" | "chu-viet" | "toan" | "kham-pha" | "van-dong" | "am-nhac" | "tao-hinh";
export type TietHoc = {
  loai: LoaiTiet;
  deTai: string;
  linhVuc: LinhVuc;
  tiet: string;
  tinhTrang: "chua-xac-dinh" | "chua-biet" | "da-biet" | "on-tap";
  phuongPhap: string;
};
export type NguCanhGiaoAnThang = {
  keHoachId: string;
  nhomId: string;
  thang: string;
  ngay?: string;
  chuDe: string;
  doTuoi: DoTuoi;
  tietHoc: TietHoc;
  phan: { tieuDe: string; noiDung: string }[];
  boMucTieu?: Pick<BoMucTieu, "id" | "ten" | "nguon" | "phienBan">;
  mucTieu: MucTieuGiaoDuc[];
};
export type PhanNoiDung = {
  id: string;
  tieuDe: string; // Ví dụ: VĐCB, TCVĐ, chuẩn bị, kỹ năng, góc trọng tâm…
  noiDung: string; // Giữ nguyên xuống dòng; không ép thành tên hoạt động một dòng.
  giaoAnId?: string;
};
export type NoiDungNhom = {
  id: string;
  nhom: NhomHoatDong;
  trangThai: "chua-nhap" | "co-noi-dung" | "khong-ap-dung";
  cachApDung: "bo-sung" | "thay-the";
  phan: PhanNoiDung[];
  mucTieuIds?: string[];
  tietHoc?: TietHoc;
  giaoAnId?: string;
};
export type NgayTrongThang = { id: string; ngay: string; nhom: NoiDungNhom[] };
export type TuanTrongThang = {
  id: string;
  chuDe: string;
  tuNgay: string; // YYYY-MM-DD; cho phép tuần ngắn, ngày học không liên tiếp.
  denNgay: string;
  nhom: NoiDungNhom[];
  ngay: NgayTrongThang[];
};
export type KeHoachThang = {
  phienBan: 1;
  id: string;
  thang: string; // YYYY-MM, độc lập với tháng hiện tại của máy.
  chuDe: string;
  doTuoi: DoTuoi;
  tenLop: string;
  giaoVien: string[];
  tuNgay: string;
  denNgay: string;
  nhom: NoiDungNhom[];
  tuan: TuanTrongThang[];
  boMucTieu?: BoMucTieu;
  trinhBay?: { khoGiay: "Letter" | "A4"; coChu: 12 | 13 | 14 };
  thongTinIn?: { tenTruong: string; toKhoi: string; namHoc: string; diaDanh: string; ngayLap: string; banGiamHieu: string; khoiTruong: string };
  danhGia?: { giaoVien: string; banGiamHieu: string };
  _tieuDe?: string;
};

export type LoaiTaiLieu = "giao-an" | "khbd" | "phieu" | "tro-choi" | "tin-nhan" | "ke-hoach-tuan" | "ke-hoach-thang";

export type TaiLieu = {
  id: string;
  loai: LoaiTaiLieu;
  tieuDe: string;
  chuDe: string;
  capNhat: string; // ISO
  noiDung?: Record<string, unknown>;
};

// F5 — Nội dung một phiếu học tập (đủ để dựng bản xem trước và xuất PDF)
export type PhieuHocTap = {
  mau: MauPhieu;
  chuDe: string;
  noiDung?: string;
  tuyChinh?: {
    phamVi?: number; // Số lượng tối đa / tổng cần tách, từ 3 đến 10.
    chuCai?: string[]; // 1–6 chữ cái tiếng Việt.
    quyLuat?: "AB" | "AAB" | "ABB";
  };
  baiTapAi?: BaiTapPhieuAi;
  doTuoi?: string;
};

export const HINH_PHIEU = ["circle", "square", "triangle", "star", "house", "tree", "flower", "fish", "car"] as const;
export type HinhPhieu = typeof HINH_PHIEU[number];
export type DongPhieuAi = {
  lenh: string;
  hinh?: HinhPhieu;
  nhan?: string;
  soLuong?: number;
  luaChon?: number[];
  day?: string[];
  chuMau?: string;
  net?: "ngang" | "xien" | "cong" | "gap-khuc";
  hinhB?: HinhPhieu | "khong";
  benTrai?: number;
  benPhai?: number;
  tong?: number;
  nhomMot?: number;
  a?: number;
  b?: number;
  phep?: "+" | "-";
};
export type BaiTapPhieuAi = { tieuDe: string; huongDan: string; dong: DongPhieuAi[] };

export const PHIEU_TIEU_DE: Record<MauPhieu, string> = {
  "to-mau": "Bé tô màu",
  "noi-hinh": "Bé nối hình",
  "dem-khoanh": "Bé đếm và khoanh số đúng",
  "dien-chu-so": "Bé điền chữ, số còn thiếu",
  "tim-diem-khac": "Bé tìm điểm khác",
  "to-net": "Bé làm quen các nét",
  "tim-chu": "Bé tìm chữ cái",
  "to-chu": "Bé tô chữ cái",
  "quy-luat": "Bé tìm quy luật",
  "so-sanh": "Bé so sánh số lượng",
  "tach-gop": "Bé tách và gộp",
  "cong-tru": "Bé làm phép tính",
};

// Số lượng đồ vật ở từng dòng của phiếu "đếm và khoanh số" (dữ liệu mẫu cho đến khi nối AI).
export const PHIEU_SO_LUONG = [3, 5, 2, 4];

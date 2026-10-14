import { LINH_VUC, type BoMucTieu, type LoaiTiet, type MucTieuGiaoDuc, type TietHoc } from "./types";

export const LOAI_TIET: Record<LoaiTiet, { ten: string; linhVuc: (typeof LINH_VUC)[number]; phan: string[] }> = {
  "van-hoc": { ten: "Văn học", linhVuc: LINH_VUC[2], phan: ["Làm quen tác phẩm", "Đàm thoại"] },
  "chu-viet": { ten: "Làm quen chữ viết", linhVuc: LINH_VUC[2], phan: ["Làm quen chữ viết", "Luyện tập"] },
  toan: { ten: "Làm quen với toán", linhVuc: LINH_VUC[1], phan: ["Nội dung trọng tâm", "Luyện tập"] },
  "kham-pha": { ten: "Khám phá", linhVuc: LINH_VUC[1], phan: ["Nội dung khám phá", "Trải nghiệm"] },
  "van-dong": { ten: "Vận động", linhVuc: LINH_VUC[0], phan: ["VĐCB", "TCVĐ"] },
  "am-nhac": { ten: "Âm nhạc", linhVuc: LINH_VUC[4], phan: ["NDTT", "NDKH"] },
  "tao-hinh": { ten: "Tạo hình", linhVuc: LINH_VUC[4], phan: ["Nội dung tạo hình", "Kỹ năng"] },
};
export const TINH_TRANG_TIET = { "chua-xac-dinh": "Chưa xác định", "chua-biet": "Trẻ chưa biết", "da-biet": "Trẻ đã biết", "on-tap": "Ôn tập" } as const;
export function nhanMucTieu(mt: MucTieuGiaoDuc) { return mt.chiTieu ? `${mt.ma} · Chỉ tiêu ${mt.chiTieu}` : mt.ma; }
export function docTietHoc(value: unknown): TietHoc {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Thông tin loại tiết chưa hợp lệ.");
  const v = value as Record<string, unknown>;
  if (typeof v.loai !== "string" || !Object.hasOwn(LOAI_TIET, v.loai) || !LINH_VUC.includes(v.linhVuc as never) || typeof v.tinhTrang !== "string" || !Object.hasOwn(TINH_TRANG_TIET, v.tinhTrang)) throw new Error("Loại tiết, lĩnh vực hoặc trạng thái học chưa hợp lệ.");
  for (const [key, max] of [["deTai", 200], ["tiet", 200], ["phuongPhap", 1000]] as const) {
    if (typeof v[key] !== "string" || (v[key] as string).length > max || (key === "deTai" && !(v[key] as string).trim())) throw new Error(`Cô nhập đề tài và kiểm tra độ dài thông tin tiết học (${key}).`);
  }
  return value as TietHoc;
}

// Trích mô tả cột mục tiêu trong file người dùng cung cấp. Không phải danh mục
// mã quốc gia; không tự gán lĩnh vực khi tài liệu không xác định rõ.
const MT_THANG_10: [string, string, string][] = [
  ["MT40", "1.1", "Nói đúng họ, tên, ngày sinh, giới tính của bản thân khi được hỏi, trò chuyện."],
  ["MT43", "1.5", "Nói họ tên và đặc điểm của các bạn trong lớp khi được hỏi, trò chuyện."],
  ["MT95", "3.2", "Nói lên ý tưởng và tạo ra các sản phẩm tạo hình theo ý thích."],
  ["MT66", "1.2", "Nói được điều bé thích, không thích, những việc bé làm được và việc gì bé không làm được.\n- Nói được mình có điểm gì giống và khác bạn (dáng vẻ bên ngoài, giới tính, sở thích và khả năng).\n- Thể hiện sự vui thích khi hoàn thành công việc."],
  ["MT9", "1.2", "Nói được tên một số món ăn hàng ngày và dạng chế biến đơn giản: rau có thể luộc, nấu canh; thịt có thể luộc, rán, kho; gạo nấu cơm, nấu cháo…"],
  ["MT8", "1.1", "Lựa chọn được một số thực phẩm khi được gọi tên nhóm:\n- Thực phẩm giàu chất đạm: thịt, cá…\n- Thực phẩm giàu vitamin và muối khoáng: rau, quả…"],
  ["MT22", "1.4", "Thu thập thông tin về đối tượng bằng nhiều cách khác nhau: xem sách tranh ảnh, băng hình, trò chuyện và thảo luận."],
  ["MT49", "1.3", "Lắng nghe và nhận xét ý kiến của người đối thoại."],
  ["MT16", "4.2", "Nhận biết được nguy cơ không an toàn khi ăn uống và phòng tránh:\n- Biết cười đùa trong khi ăn, uống hoặc khi ăn các loại quả có hạt dễ bị hóc sặc, ....\n- Biết không tự ý uống thuốc.\n- Biết ăn thức ăn có mùi ôi; ăn lá, quả lạ dễ bị ngộ độc; uống rượu, bia, cà phê, hút thuốc lá không tốt cho sức khoẻ."],
  ["MT65", "1.1; 1.3", "Nói được họ tên, tuổi, giới tính của bản thân, tên bố, mẹ, địa chỉ nhà hoặc điện thoại.\n1.3. Biết mình là con/ cháu/ anh/ chị/ em trong gia đình.\n- Chấp nhận sự khác biệt của người khác với mình."],
  ["MT38", "5.1", "Sử dụng lời nói và hành động để chỉ vị trí của đồ vật so với vật làm chuẩn."],
];
export function taoBoMucTieuThang10(): BoMucTieu {
  return { id: crypto.randomUUID(), ten: "Bộ mục tiêu lớp 5–6 tuổi — mẫu tháng 10", nguon: "Kế hoạch giáo dục tháng 10 do giáo viên cung cấp (kehoachgiaoduc-1791170229437.doc)", phienBan: "10/2026", doTuoi: "5-6", mucTieu: MT_THANG_10.map(([ma, chiTieu, moTa]) => ({ id: crypto.randomUUID(), ma, chiTieu, moTa })) };
}

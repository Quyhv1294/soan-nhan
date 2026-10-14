import { MOCK_GIAO_AN, MOCK_KHBD, MOCK_TIN_NHAN, MOCK_TUAN } from "./mock-data";
import type { LoaiSinh } from "./prompts";
import { DO_TUOI_LABEL, LINH_VUC, type DoTuoi, type GiaoAnMamNon, type KeHoachBaiDay, type NguCanhGiaoAnThang } from "./types";

// Dữ liệu mẫu để chạy thử giao diện khi chưa cấu hình AI (không có AI_API_KEY).
// Ghép thông tin người dùng nhập vào bản mẫu để thấy luồng chạy; nội dung thân bài giống nhau mọi lần.
export function taoBanMau(loai: LoaiSinh, input: Record<string, string>, context?: NguCanhGiaoAnThang): unknown | null {
  switch (loai) {
    case "giao-an": {
      const doTuoi = (Object.keys(DO_TUOI_LABEL) as DoTuoi[]).find((k) => DO_TUOI_LABEL[k] === input.doTuoi);
      const linhVuc = LINH_VUC.find((l) => l === input.linhVuc);
      return {
        ...MOCK_GIAO_AN,
        id: crypto.randomUUID(),
        tenHoatDong: input.tenHoatDong?.trim() || MOCK_GIAO_AN.tenHoatDong,
        chuDe: input.chuDe?.trim() || MOCK_GIAO_AN.chuDe,
        doTuoi: doTuoi ?? MOCK_GIAO_AN.doTuoi,
        linhVuc: linhVuc ?? MOCK_GIAO_AN.linhVuc,
        ...(context ? { nguCanhKeHoach: context } : {}),
      } satisfies GiaoAnMamNon;
    }
    case "khbd": {
      const lop = Number(input.lop?.replace(/\D/g, ""));
      return {
        ...MOCK_KHBD,
        id: crypto.randomUUID(),
        tenBai: input.tenBai?.trim() || MOCK_KHBD.tenBai,
        lop: lop >= 1 && lop <= 5 ? (lop as KeHoachBaiDay["lop"]) : MOCK_KHBD.lop,
        mon: input.mon === "Tiếng Việt" ? "Tiếng Việt" : "Toán",
        boSach: input.boSach || MOCK_KHBD.boSach,
        tiet: input.tiet?.trim() || undefined,
      } satisfies KeHoachBaiDay;
    }
    case "ke-hoach-tuan":
      return { ...MOCK_TUAN, id: crypto.randomUUID() };
    case "tin-nhan": {
      // Chỉ đổi lời chào và lời kết theo giọng văn.
      const GIONG: Record<string, [string, string]> = {
        "Thân mật": ["Chào các mẹ các bố ạ,", "Cảm ơn cả nhà nhiều nha! 💛"],
        "Trang trọng": ["Kính gửi Quý phụ huynh lớp Mẫu giáo nhỡ A2,", "Trân trọng cảm ơn Quý phụ huynh đã quan tâm và phối hợp cùng nhà trường."],
      };
      const doan = MOCK_TIN_NHAN.split("\n\n");
      const g = GIONG[input.giongVan ?? ""];
      if (g) {
        doan[0] = g[0];
        doan[doan.length - 1] = g[1];
      }
      return doan.join("\n\n");
    }
    default:
      return null;
  }
}

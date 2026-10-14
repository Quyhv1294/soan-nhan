import { SaiKhuon } from "./ai";
import { LINH_VUC, type BuocTienHanh, type GiaoAnMamNon, type HoatDongTrongNgay, type KeHoachBaiDay, type KeHoachTuan } from "./types";

// Hai việc cho mỗi loại tài liệu:
// 1. Schema gửi cho AI để ép trả JSON đúng khuôn (chỉ các trường AI phải viết).
// 2. Hàm kiểm tra lại kết quả, vì schema không bảo đảm nội dung hợp lý. Sai thì ném SaiKhuon để gọi lại.
// Các trường do người dùng chọn (tên hoạt động, độ tuổi, lớp…) luôn lấy từ biểu mẫu, không để AI đổi.

const chu = { type: "string" };
const dsChu = { type: "array", items: chu };

// ---------- Hàm kiểm tra nhỏ ----------

const can = (dieuKien: unknown, loi: string): void => {
  if (!dieuKien) throw new SaiKhuon(loi);
};

const laObj = (x: unknown, ten: string): Record<string, unknown> => {
  can(x && typeof x === "object" && !Array.isArray(x), `${ten} phải là một khối dữ liệu.`);
  return x as Record<string, unknown>;
};

const laChu = (x: unknown, ten: string): string => {
  can(typeof x === "string" && x.trim(), `${ten} phải là chữ và không được để trống.`);
  return (x as string).trim();
};

const laDsChu = (x: unknown, ten: string, toiThieu = 1): string[] => {
  can(Array.isArray(x) && x.length >= toiThieu, `${ten} phải có ít nhất ${toiThieu} dòng.`);
  return (x as unknown[]).map((s, i) => laChu(s, `${ten}[${i}]`));
};

const laDs = (x: unknown, ten: string, toiThieu = 1): unknown[] => {
  can(Array.isArray(x) && x.length >= toiThieu, `${ten} phải có ít nhất ${toiThieu} mục.`);
  return x as unknown[];
};

// ---------- F3 Giáo án mầm non ----------

export const giaoAnSchema = {
  type: "object",
  properties: {
    thoiLuong: chu,
    mucDich: { type: "object", properties: { kienThuc: dsChu, kyNang: dsChu, thaiDo: dsChu }, required: ["kienThuc", "kyNang", "thaiDo"] },
    chuanBi: { type: "object", properties: { cuaCo: dsChu, cuaTre: dsChu, diaDiem: chu }, required: ["cuaCo", "cuaTre", "diaDiem"] },
    tienHanh: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ten: chu,
          buoc: {
            type: "array",
            items: { type: "object", properties: { thoiGian: chu, hoatDongCo: dsChu, hoatDongTre: dsChu }, required: ["thoiGian", "hoatDongCo", "hoatDongTre"] },
          },
        },
        required: ["ten", "buoc"],
      },
    },
  },
  required: ["thoiLuong", "mucDich", "chuanBi", "tienHanh"],
};

export type DauVaoGiaoAn = Pick<GiaoAnMamNon, "tenHoatDong" | "linhVuc" | "chuDe" | "doTuoi" | "nguCanhKeHoach">;

export function kiemTraGiaoAn(raw: unknown, dau: DauVaoGiaoAn): GiaoAnMamNon {
  const r = laObj(raw, "Giáo án");
  if (dau.nguCanhKeHoach) {
    const allowed = new Set(dau.nguCanhKeHoach.mucTieu.flatMap((mt) => mt.ma.toUpperCase().match(/MT\d+/g) ?? []));
    const mentioned = JSON.stringify(r).toUpperCase().match(/\bMT\s*\d+(?:\.\d+)*/g) ?? [];
    can(mentioned.every((ma) => allowed.has(ma.replace(/\s/g, "").split(".")[0])), "Giáo án có mã MT ngoài các mục tiêu đã chọn trong kế hoạch.");
  }
  const mucDich = laObj(r.mucDich, "mucDich");
  const chuanBi = laObj(r.chuanBi, "chuanBi");
  const tienHanh = laDs(r.tienHanh, "tienHanh", 3).map((h, i) => {
    const o = laObj(h, `tienHanh[${i}]`);
    const buoc: BuocTienHanh[] = laDs(o.buoc, `tienHanh[${i}].buoc`).map((b, j) => {
      const x = laObj(b, `tienHanh[${i}].buoc[${j}]`);
      return {
        thoiGian: laChu(x.thoiGian, "thoiGian"),
        hoatDongCo: laDsChu(x.hoatDongCo, "hoatDongCo"),
        hoatDongTre: laDsChu(x.hoatDongTre, "hoatDongTre"),
      };
    });
    return { ten: laChu(o.ten, `tienHanh[${i}].ten`), buoc };
  });
  return {
    id: crypto.randomUUID(),
    ...dau,
    thoiLuong: laChu(r.thoiLuong, "thoiLuong"),
    mucDich: {
      kienThuc: laDsChu(mucDich.kienThuc, "kienThuc"),
      kyNang: laDsChu(mucDich.kyNang, "kyNang"),
      thaiDo: laDsChu(mucDich.thaiDo, "thaiDo"),
    },
    chuanBi: {
      cuaCo: laDsChu(chuanBi.cuaCo, "cuaCo"),
      cuaTre: laDsChu(chuanBi.cuaTre, "cuaTre"),
      diaDiem: typeof chuanBi.diaDiem === "string" && chuanBi.diaDiem.trim() ? chuanBi.diaDiem.trim() : undefined,
    },
    tienHanh,
  };
}

// ---------- F4 Kế hoạch bài dạy tiểu học ----------

export const khbdSchema = {
  type: "object",
  properties: {
    yeuCauCanDat: {
      type: "object",
      properties: { nangLucDacThu: dsChu, nangLucChung: dsChu, phamChat: dsChu },
      required: ["nangLucDacThu", "nangLucChung", "phamChat"],
    },
    doDung: { type: "object", properties: { giaoVien: dsChu, hocSinh: dsChu }, required: ["giaoVien", "hocSinh"] },
    hoatDong: {
      type: "array",
      items: { type: "object", properties: { ten: chu, mucTieu: chu, giaoVien: dsChu, hocSinh: dsChu }, required: ["ten", "mucTieu", "giaoVien", "hocSinh"] },
    },
  },
  required: ["yeuCauCanDat", "doDung", "hoatDong"],
};

export type DauVaoKhbd = Pick<KeHoachBaiDay, "lop" | "mon" | "boSach" | "tenBai" | "tiet">;

export function kiemTraKhbd(raw: unknown, dau: DauVaoKhbd): KeHoachBaiDay {
  const r = laObj(raw, "Kế hoạch bài dạy");
  const y = laObj(r.yeuCauCanDat, "yeuCauCanDat");
  const d = laObj(r.doDung, "doDung");
  return {
    id: crypto.randomUUID(),
    ...dau,
    yeuCauCanDat: {
      nangLucDacThu: laDsChu(y.nangLucDacThu, "nangLucDacThu"),
      nangLucChung: laDsChu(y.nangLucChung, "nangLucChung"),
      phamChat: laDsChu(y.phamChat, "phamChat"),
    },
    doDung: { giaoVien: laDsChu(d.giaoVien, "doDung.giaoVien"), hocSinh: laDsChu(d.hocSinh, "doDung.hocSinh") },
    hoatDong: laDs(r.hoatDong, "hoatDong", 3).map((h, i) => {
      const o = laObj(h, `hoatDong[${i}]`);
      return {
        ten: laChu(o.ten, `hoatDong[${i}].ten`),
        mucTieu: laChu(o.mucTieu, `hoatDong[${i}].mucTieu`),
        giaoVien: laDsChu(o.giaoVien, "giaoVien"),
        hocSinh: laDsChu(o.hocSinh, "hocSinh"),
      };
    }),
  };
}

// ---------- F2 Kế hoạch tuần ----------

export const THU = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"] as const;
export const BUOI = ["Đón trẻ", "Hoạt động học", "Hoạt động ngoài trời", "Hoạt động góc", "Hoạt động chiều"] as const;

export const tuanSchema = {
  type: "object",
  properties: {
    nhanh: chu,
    ngay: {
      type: "array",
      items: {
        type: "object",
        properties: {
          thu: { type: "string", enum: [...THU] },
          hoatDong: {
            type: "array",
            items: {
              type: "object",
              properties: { buoi: { type: "string", enum: [...BUOI] }, ten: chu, linhVuc: { type: "string", enum: [...LINH_VUC] } },
              required: ["buoi", "ten"],
            },
          },
        },
        required: ["thu", "hoatDong"],
      },
    },
  },
  required: ["ngay"],
};

export type DauVaoTuan = Pick<KeHoachTuan, "chuDe" | "doTuoi" | "tuNgay"> & { nhanh?: string };

export function kiemTraTuan(raw: unknown, dau: DauVaoTuan): KeHoachTuan {
  const r = laObj(raw, "Kế hoạch tuần");
  const ngay = laDs(r.ngay, "ngay", 5).map((n, i) => {
    const o = laObj(n, `ngay[${i}]`);
    // Thứ tự và tên thứ do máy chủ đặt, không tin AI.
    const thu = THU[i];
    can(thu, "Kế hoạch tuần có nhiều hơn 5 ngày.");
    const ds = laDs(o.hoatDong, `${thu}.hoatDong`, 5).map((h, k) => {
      const x = laObj(h, `${thu}.hoatDong[${k}]`);
      const buoi = BUOI.find((b) => b === x.buoi);
      can(buoi, `${thu}: buổi "${String(x.buoi)}" không hợp lệ.`);
      const linhVuc = LINH_VUC.find((l) => l === x.linhVuc);
      const hd: HoatDongTrongNgay = { id: `t${i + 2}-${k}`, buoi: buoi!, ten: laChu(x.ten, `${thu}.${buoi}.ten`) };
      if (buoi === "Hoạt động học") {
        can(linhVuc, `${thu}: Hoạt động học thiếu lĩnh vực.`);
        hd.linhVuc = linhVuc;
      }
      return hd;
    });
    // Mỗi ngày đủ 5 buổi, mỗi buổi đúng một lần, xếp đúng thứ tự.
    const theoThuTu = BUOI.map((b) => ds.find((h) => h.buoi === b));
    can(theoThuTu.every(Boolean), `${thu} thiếu buổi.`);
    return { thu, hoatDong: theoThuTu as HoatDongTrongNgay[] };
  });
  can(ngay.length === 5, "Kế hoạch tuần phải có đúng 5 ngày.");
  const nhanh = typeof r.nhanh === "string" && r.nhanh.trim() ? r.nhanh.trim() : dau.nhanh;
  return { id: crypto.randomUUID(), chuDe: dau.chuDe, nhanh, doTuoi: dau.doTuoi, tuNgay: dau.tuNgay, ngay };
}

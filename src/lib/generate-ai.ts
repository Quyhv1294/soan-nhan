import { sinhNoiDung, SaiKhuon, type AiCauHinh, type KetQuaAi } from "./ai";
import { giaoAnSchema, khbdSchema, kiemTraGiaoAn, kiemTraKhbd, kiemTraTuan, tuanSchema } from "./ai-schemas";
import { MOCK_TUAN } from "./mock-data";
import { buildPrompt, lamSachDauVao, type LoaiSinh } from "./prompts";
import { DO_TUOI_LABEL, LINH_VUC, type DoTuoi, type KeHoachBaiDay, type NguCanhGiaoAnThang } from "./types";
import { hocLieuSchema, kiemTraHocLieu } from "./hoc-lieu-ai";
import { docYeuCauHocLieu } from "./yeu-cau-hoc-lieu";

// Người dùng gửi thiếu hoặc sai thông tin: trả 400, không tốn lượt gọi AI.
export class DauVaoSai extends Error {}

export class ChuaHoTro extends Error {}

const can = (dk: unknown, loi: string) => {
  if (!dk) throw new DauVaoSai(loi);
};

function docDoTuoi(v: string | undefined): DoTuoi {
  const k = (Object.keys(DO_TUOI_LABEL) as DoTuoi[]).find((x) => DO_TUOI_LABEL[x] === v || x === v);
  can(k, "Độ tuổi không hợp lệ.");
  return k!;
}

// Thứ Hai của tuần kế tiếp (nếu hôm nay đã là thứ Hai thì lấy chính hôm nay), dạng YYYY-MM-DD.
function thuHaiGanNhat(): string {
  const d = new Date();
  const lui = (d.getUTCDay() + 6) % 7; // số ngày từ thứ Hai gần nhất đã qua
  d.setUTCDate(d.getUTCDate() + (lui === 0 ? 0 : 7 - lui));
  return d.toISOString().slice(0, 10);
}

const ngayVN = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { timeZone: "UTC", day: "numeric", month: "numeric" });

export type KetQuaSinh = { data: unknown; ket: KetQuaAi };

export async function taoBangAi(cfg: AiCauHinh, loai: LoaiSinh, tho: Record<string, unknown>, context?: NguCanhGiaoAnThang): Promise<KetQuaSinh> {
  const input = lamSachDauVao(loai, tho);
  const mohinh = [cfg.manh, cfg.nhanh];

  switch (loai) {
    case "phieu": case "tro-choi": {
      let request;
      try { request = docYeuCauHocLieu(loai, input); }
      catch (e) { throw new DauVaoSai(e instanceof Error ? e.message : "Yêu cầu chưa hợp lệ."); }
      const { system, user } = buildPrompt(loai, { ...input, bienThe: crypto.randomUUID() });
      return sinhNoiDung(cfg, { system, user, schema: hocLieuSchema(loai, request.mau), mohinh, kiemTra: (r) => kiemTraHocLieu(r, loai, input) });
    }
    case "giao-an": {
      can(input.tenHoatDong, "Cô chưa nhập tên hoạt động.");
      const linhVuc = LINH_VUC.find((l) => l === input.linhVuc);
      can(linhVuc, "Lĩnh vực không hợp lệ.");
      const dau = { tenHoatDong: input.tenHoatDong, linhVuc: linhVuc!, chuDe: input.chuDe ?? "", doTuoi: docDoTuoi(input.doTuoi), ...(context ? { nguCanhKeHoach: context } : {}) };
      const { system, user } = buildPrompt(loai, { ...input, doTuoi: DO_TUOI_LABEL[dau.doTuoi] }, context);
      return sinhNoiDung(cfg, { system, user, schema: giaoAnSchema, mohinh, kiemTra: (r) => kiemTraGiaoAn(r, dau) });
    }

    case "khbd": {
      can(input.tenBai, "Cô chưa nhập tên bài.");
      const lop = Number(input.lop?.replace(/\D/g, ""));
      can(lop >= 1 && lop <= 5, "Lớp không hợp lệ.");
      can(input.mon === "Toán" || input.mon === "Tiếng Việt", "Môn không hợp lệ.");
      const dau = {
        lop: lop as KeHoachBaiDay["lop"],
        mon: input.mon as KeHoachBaiDay["mon"],
        boSach: input.boSach || "Kết nối tri thức",
        tenBai: input.tenBai,
        tiet: input.tiet,
      };
      const { system, user } = buildPrompt(loai, { ...input, lop: `Lớp ${lop}`, boSach: dau.boSach });
      return sinhNoiDung(cfg, { system, user, schema: khbdSchema, mohinh, kiemTra: (r) => kiemTraKhbd(r, dau) });
    }

    case "ke-hoach-tuan": {
      can(input.chuDe, "Cô chưa nhập chủ đề.");
      const dau = { chuDe: input.chuDe, nhanh: input.nhanh, doTuoi: docDoTuoi(input.doTuoi), tuNgay: thuHaiGanNhat() };
      const { system, user } = buildPrompt(loai, { ...input, doTuoi: DO_TUOI_LABEL[dau.doTuoi] });
      return sinhNoiDung(cfg, { system, user, schema: tuanSchema, mohinh, kiemTra: (r) => kiemTraTuan(r, dau) });
    }

    case "tin-nhan": {
      const t = MOCK_TUAN;
      const denNgay = new Date(t.tuNgay);
      denNgay.setUTCDate(denNgay.getUTCDate() + 4);
      const bonDuLieu = {
        giongVan: input.giongVan || "Lịch sự, ngắn gọn",
        tenLop: input.tenLop || "Mẫu giáo nhỡ A2",
        chuDe: input.chuDe || t.chuDe,
        nhanh: input.nhanh || t.nhanh || "",
        tuNgay: input.tuNgay || ngayVN(t.tuNgay),
        denNgay: input.denNgay || ngayVN(denNgay.toISOString()),
        hoatDongHoc: input.hoatDongHoc || t.ngay.map((n) => `${n.thu}: ${n.hoatDong.find((h) => h.buoi === "Hoạt động học")?.ten}`).join("; "),
      };
      const { system, user } = buildPrompt(loai, bonDuLieu);
      return sinhNoiDung(cfg, {
        system,
        user,
        mohinh: [cfg.nhanh], // tin ngắn, mô hình nhanh là đủ
        kiemTra: (r) => {
          // Phòng khi AI vẫn bọc khối mã hoặc dùng in đậm kiểu markdown.
          const chu = String(r).replace(/^```\w*\n?|\n?```$/g, "").replace(/\*\*/g, "").trim();
          if (chu.length < 60) throw new SaiKhuon("Tin nhắn quá ngắn.");
          return chu;
        },
      });
    }

    default:
      throw new ChuaHoTro("Loại nội dung này chưa được hỗ trợ.");
  }
}

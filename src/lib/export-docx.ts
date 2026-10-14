import {
  AlignmentType,
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { DO_TUOI_LABEL, type GiaoAnMamNon, type KeHoachBaiDay, type KeHoachTuan } from "./types";
import { dongNguCanhGiaoAn } from "./ngu-canh-giao-an";
import { keHoachThangDocx } from "./ke-hoach-thang-docx";

// Xuất file Word (.docx) từ đúng các khuôn JSON trong types.ts — giống bản xem trước trên màn hình.

const FONT = "Times New Roman";
const SIZE = 26; // 13pt, đơn vị half-point

const run = (text: string, o: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
  new TextRun({ text, font: FONT, size: o.size ?? SIZE, bold: o.bold, italics: o.italics });

const para = (children: TextRun[], o: { center?: boolean; before?: number; after?: number } = {}) =>
  new Paragraph({
    children,
    alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 60 },
  });

const tieuDe = (text: string) => para([run(text, { bold: true })], { before: 200 });
const tieuDeNho = (text: string) => para([run(text, { bold: true, italics: true })]);
const dong = (items: string[]) => items.map((x) => para([run(`- ${x}`)]));

const cell = (children: Paragraph[], o: { width?: number; span?: number } = {}) =>
  new TableCell({
    children: children.length ? children : [para([run("")])],
    columnSpan: o.span,
    width: o.width ? { size: o.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });

const bang = (rows: TableRow[]) => new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } });

const dauBang = (cols: { text: string; width?: number }[]) =>
  new TableRow({
    tableHeader: true,
    children: cols.map((c) => cell([para([run(c.text, { bold: true })], { center: true })], { width: c.width })),
  });

async function toBuffer(children: (Paragraph | Table)[], landscape = false) {
  const doc = new Document({
    creator: "Soạn Nhàn",
    sections: [
      {
        properties: {
          page: {
            size: landscape ? { orientation: PageOrientation.LANDSCAPE } : undefined,
            margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }, // 2cm / 2cm / 3cm / 1,5cm theo mẫu văn bản
          },
        },
        children,
      },
    ],
  });
  return Packer.toBuffer(doc);
}

export function giaoAnDocx(ga: GiaoAnMamNon) {
  const rows = [
    dauBang([{ text: "Thời gian", width: 16 }, { text: "Hoạt động của cô" }, { text: "Hoạt động của trẻ", width: 32 }]),
    ...ga.tienHanh.flatMap((hd) => [
      new TableRow({ children: [cell([para([run(hd.ten, { bold: true })])], { span: 3 })] }),
      ...hd.buoc.map(
        (b) => new TableRow({ children: [cell([para([run(b.thoiGian)])]), cell(dong(b.hoatDongCo)), cell(dong(b.hoatDongTre))] }),
      ),
    ]),
  ];
  return toBuffer([
    para([run("GIÁO ÁN", { bold: true, size: 30 })], { center: true }),
    para([run(`Lĩnh vực: ${ga.linhVuc}`, { italics: true })], { center: true, after: 160 }),
    para([run("Chủ đề: ", { bold: true }), run(ga.chuDe)]),
    para([run("Đề tài: ", { bold: true }), run(ga.tenHoatDong)]),
    para([run("Độ tuổi: ", { bold: true }), run(`${DO_TUOI_LABEL[ga.doTuoi] ?? ga.doTuoi}. `), run("Thời gian: ", { bold: true }), run(ga.thoiLuong)]),
    ...dongNguCanhGiaoAn(ga.nguCanhKeHoach).flatMap((row) => row.noiDung.split("\n").map((line, index) => para([...(index === 0 ? [run(`${row.nhan}: `, { bold: true })] : []), run(line)]))),
    tieuDe("I. MỤC ĐÍCH, YÊU CẦU"),
    tieuDeNho("1. Kiến thức"),
    ...dong(ga.mucDich.kienThuc),
    tieuDeNho("2. Kỹ năng"),
    ...dong(ga.mucDich.kyNang),
    tieuDeNho("3. Thái độ"),
    ...dong(ga.mucDich.thaiDo),
    tieuDe("II. CHUẨN BỊ"),
    tieuDeNho("1. Đồ dùng của cô"),
    ...dong(ga.chuanBi.cuaCo),
    tieuDeNho("2. Đồ dùng của trẻ"),
    ...dong(ga.chuanBi.cuaTre),
    ...(ga.chuanBi.diaDiem ? [para([run("3. Địa điểm: ", { bold: true, italics: true }), run(ga.chuanBi.diaDiem)])] : []),
    tieuDe("III. TIẾN HÀNH"),
    bang(rows),
  ]);
}

export function khbdDocx(k: KeHoachBaiDay) {
  const rows = [
    dauBang([{ text: "Hoạt động của giáo viên" }, { text: "Hoạt động của học sinh", width: 40 }]),
    ...k.hoatDong.flatMap((hd) => [
      new TableRow({ children: [cell([para([run(`${hd.ten} `, { bold: true }), run(`Mục tiêu: ${hd.mucTieu}`, { italics: true })])], { span: 2 })] }),
      new TableRow({ children: [cell(dong(hd.giaoVien)), cell(dong(hd.hocSinh))] }),
    ]),
  ];
  return toBuffer([
    para([run("KẾ HOẠCH BÀI DẠY", { bold: true, size: 30 })], { center: true }),
    para([run(`Môn: ${k.mon}, lớp ${k.lop}. Bộ sách: ${k.boSach}`)], { center: true }),
    para([run(`${k.tenBai}${k.tiet ? ` (${k.tiet})` : ""}`, { bold: true })], { center: true, after: 160 }),
    tieuDe("I. YÊU CẦU CẦN ĐẠT"),
    tieuDeNho("1. Năng lực đặc thù"),
    ...dong(k.yeuCauCanDat.nangLucDacThu),
    tieuDeNho("2. Năng lực chung"),
    ...dong(k.yeuCauCanDat.nangLucChung),
    tieuDeNho("3. Phẩm chất"),
    ...dong(k.yeuCauCanDat.phamChat),
    tieuDe("II. ĐỒ DÙNG DẠY HỌC"),
    para([run("Giáo viên: ", { bold: true }), run(k.doDung.giaoVien.join("; "))]),
    para([run("Học sinh: ", { bold: true }), run(k.doDung.hocSinh.join("; "))]),
    tieuDe("III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU"),
    bang(rows),
    tieuDe("IV. ĐIỀU CHỈNH SAU BÀI DẠY"),
    para([run(k.dieuChinh ?? "...............................................................................................")]),
  ]);
}

export function tuanDocx(t: KeHoachTuan) {
  const buoi = t.ngay[0]?.hoatDong.map((h) => h.buoi) ?? [];
  const rows = [
    dauBang([{ text: "Hoạt động", width: 12 }, ...t.ngay.map((n) => ({ text: n.thu, width: 17.6 }))]),
    ...buoi.map(
      (b) =>
        new TableRow({
          children: [
            cell([para([run(b, { bold: true, size: 22 })])]),
            ...t.ngay.map((n) => {
              const hd = n.hoatDong.find((h) => h.buoi === b);
              return cell(hd ? [para([run(hd.ten, { size: 22 })]), ...(hd.linhVuc ? [para([run(hd.linhVuc, { italics: true, size: 20 })])] : [])] : []);
            }),
          ],
        }),
    ),
  ];
  return toBuffer(
    [
      para([run("KẾ HOẠCH TUẦN", { bold: true, size: 30 })], { center: true }),
      para([run(`Chủ đề: ${t.chuDe}${t.nhanh ? ` — Nhánh: ${t.nhanh}` : ""}`, { bold: true })], { center: true }),
      para([run(`${DO_TUOI_LABEL[t.doTuoi] ?? t.doTuoi}. Từ ngày ${new Date(t.tuNgay).toLocaleDateString("vi-VN", { timeZone: "UTC" })}`)], { center: true, after: 160 }),
      bang(rows),
    ],
    true,
  );
}

export const XUAT_DOCX = {
  "giao-an": giaoAnDocx,
  khbd: khbdDocx,
  "ke-hoach-tuan": tuanDocx,
  "ke-hoach-thang": keHoachThangDocx,
} as const;

export type LoaiXuat = keyof typeof XUAT_DOCX;

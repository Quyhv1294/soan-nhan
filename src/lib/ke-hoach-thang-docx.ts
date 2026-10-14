import { AlignmentType, BorderStyle, Document, Packer, PageOrientation, Paragraph, Table, TableCell, TableLayoutType, TableRow, TextRun, WidthType } from "docx";
import { cauHinhTrangThang, dungBangKeHoachThang, type DongOThang } from "./bang-ke-hoach-thang";
import { docKeHoachThang } from "./ke-hoach-thang";

export function keHoachThangDocx(raw: unknown) {
  const plan = docKeHoachThang(raw);
  const data = dungBangKeHoachThang(plan);
  const f = cauHinhTrangThang(plan);
  const mm = (value: number) => Math.round(value * 1440 / 25.4);
  const text = (s: string, bold = false, italic = false) => new TextRun({ text: s, font: "Times New Roman", size: f.coChu * 2, bold, italics: italic });
  const p = (s: string, bold = false, center = false, before = 0) => new Paragraph({ children: [text(s, bold)], alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before, after: 60, line: 300 }, keepLines: false });
  const lines = (rows: DongOThang[], center = false) => rows.flatMap((row) => row.chu.split("\n").map((s) => p(s, row.dam, center)));
  const available = mm(f.rongMm - f.le.trai - f.le.phai);
  const sizes = data.rongCot.map((w) => Math.floor(available * w / 100));
  sizes[sizes.length - 1] += available - sizes.reduce((a, b) => a + b, 0);
  const borders = { top: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, left: { style: BorderStyle.SINGLE, size: 4, color: "000000" }, right: { style: BorderStyle.SINGLE, size: 4, color: "000000" } };
  const rows = [new TableRow({ tableHeader: true, cantSplit: false, children: data.cot.map((c) => new TableCell({ children: lines(c.dong, true), columnSpan: c.soCot, width: { size: c.rong, type: WidthType.PERCENTAGE }, borders, margins: { top: 80, bottom: 80, left: 80, right: 80 } })) }), ...data.hang.map((row) => new TableRow({ cantSplit: false, children: row.o.map((c) => new TableCell({ children: lines(c.dong), columnSpan: c.soCot, rowSpan: c.soHang, width: { size: sizes.slice(c.cot, c.cot + c.soCot).reduce((a, b) => a + b, 0), type: WidthType.DXA }, borders, margins: { top: 80, bottom: 80, left: 80, right: 80 } })) }))];
  const noBorders = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };
  const signature = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: { ...noBorders, insideHorizontal: noBorders.top, insideVertical: noBorders.left }, layout: TableLayoutType.FIXED, columnWidths: [Math.floor(available / 3), Math.floor(available / 3), available - 2 * Math.floor(available / 3)], rows: [
    new TableRow({ cantSplit: true, children: data.chuKy.map((s) => new TableCell({ borders: noBorders, children: [new Paragraph({ children: [text(s.vaiTro, true)], alignment: AlignmentType.CENTER, keepNext: true }), new Paragraph({ children: [text("(Ký, ghi rõ họ tên)", false, true)], alignment: AlignmentType.CENTER, keepNext: true })] })) }),
    new TableRow({ cantSplit: false, children: data.chuKy.map((s) => new TableCell({ borders: noBorders, children: (s.ten.length ? s.ten : [""]).map((name, index) => p(name, true, true, index === 0 ? mm(25) : 0)) })) }),
  ] });
  return Packer.toBuffer(new Document({ creator: "Soạn Nhàn", styles: { default: { document: { run: { font: "Times New Roman", size: f.coChu * 2 }, paragraph: { spacing: { after: 60 } } } } }, sections: [{ properties: { page: {
    size: { width: mm(f.caoMm), height: mm(f.rongMm), orientation: PageOrientation.LANDSCAPE },
    margin: { top: mm(f.le.tren), bottom: mm(f.le.duoi), left: mm(f.le.trai), right: mm(f.le.phai) },
  } }, children: [
    new Paragraph({ children: [new TextRun({ text: data.tieuDe, font: "Times New Roman", size: (f.coChu + 2) * 2, bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 180 } }), ...data.thongTin.map((s) => p(s)),
    new Table({ rows, width: { size: available, type: WidthType.DXA }, columnWidths: sizes, layout: TableLayoutType.FIXED }),
    ...data.boMT.map((s) => p(s)),
    new Paragraph({ children: [text(data.ngayLap, false, true)], alignment: AlignmentType.RIGHT, spacing: { before: 240, after: 120 }, keepNext: true }), signature,
  ] }] }));
}

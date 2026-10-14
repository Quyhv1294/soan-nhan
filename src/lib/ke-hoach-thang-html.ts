import { cauHinhTrangThang, dungBangKeHoachThang, type DongOThang } from "./bang-ke-hoach-thang";
import { docKeHoachThang } from "./ke-hoach-thang";
import type { KeHoachThang } from "./types";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const paragraphs = (rows: DongOThang[]) => rows.map((d) => `<p${d.dam ? ' class="dam"' : ""}>${esc(d.chu)}</p>`).join("");

export function cssKeHoachThang(plan: KeHoachThang) {
  const f = cauHinhTrangThang(plan);
  return `
    @page ke-hoach-thang { size: ${f.khoGiay} landscape; margin: ${f.le.tren}mm ${f.le.phai}mm ${f.le.duoi}mm ${f.le.trai}mm; }
    .thang-paper { page: ke-hoach-thang; box-sizing: border-box; color: #000; background: #fff; color-scheme: light; font-family: "Times New Roman", Tinos, "Liberation Serif", serif; font-size: ${f.coChu}pt; line-height: 1.25; }
    .thang-paper * { box-sizing: border-box; }
    .thang-paper h1 { font-size: ${f.coChu + 2}pt; text-align: center; font-weight: bold; margin: 0 0 4mm; }
    .thang-paper p { margin: 0 0 1.5mm; white-space: pre-wrap; overflow-wrap: anywhere; orphans: 2; widows: 2; }
    .thang-paper .dam { font-weight: bold; }
    .thang-paper table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 3mm 0; }
    .thang-paper th, .thang-paper td { border: .5pt solid #000; padding: 1.5mm; vertical-align: top; background: #fff; color: #000; overflow-wrap: anywhere; }
    .thang-paper th { text-align: center; }
    .thang-paper thead { display: table-header-group; }
    .thang-paper tbody { break-inside: auto; }
    .thang-paper tr, .thang-paper td { break-inside: auto; }
    .thang-paper .thang-nhom { font-weight: bold; }
    .thang-paper .thang-ngay-lap { text-align: right; font-style: italic; margin-top: 5mm; break-after: avoid; }
    .thang-paper .thang-chu-ky { break-inside: avoid; }
    .thang-paper .thang-chu-ky th, .thang-paper .thang-chu-ky td { border: 0; text-align: center; padding: 1mm; }
    .thang-paper .thang-chu-ky .ten-nguoi-ky { padding-top: 25mm; }
    @media screen { .thang-paper { width: ${f.rongMm}mm; min-height: ${f.caoMm}mm; padding: ${f.le.tren}mm ${f.le.phai}mm ${f.le.duoi}mm ${f.le.trai}mm; } }
    @media print { .thang-paper { width: 100%; padding: 0; margin: 0; } }
  `;
}

// Dữ liệu người dùng chỉ được chèn sau khi escape; không nạp HTML/ảnh/font từ
// tài liệu gốc hoặc URL nhập vào kế hoạch. Preview và PDF dùng cùng HTML này.
export function noiDungHtmlThang(plan: KeHoachThang) {
  const table = dungBangKeHoachThang(plan);
  return `<article class="thang-paper giay-co-dinh">
    <h1>${esc(table.tieuDe)}</h1>
    ${table.thongTin.map((s) => `<p>${esc(s)}</p>`).join("")}
    <table aria-label="Kế hoạch giáo dục tháng">
      <colgroup>${table.rongCot.map((w) => `<col style="width:${w}%">`).join("")}</colgroup>
      <thead><tr>${table.cot.map((c) => `<th colspan="${c.soCot}">${paragraphs(c.dong)}</th>`).join("")}</tr></thead>
      <tbody>${table.hang.map((row) => `<tr>${row.o.map((c) => `<td colspan="${c.soCot}" rowspan="${c.soHang}"${c.loai === "nhom" ? ' class="thang-nhom"' : ""}>${paragraphs(c.dong)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    ${table.boMT.map((s) => `<p>${esc(s)}</p>`).join("")}
    <p class="thang-ngay-lap">${esc(table.ngayLap)}</p>
    <table class="thang-chu-ky" aria-label="Vị trí ký xác nhận"><tbody>
      <tr>${table.chuKy.map((s) => `<th>${esc(s.vaiTro)}</th>`).join("")}</tr>
      <tr>${table.chuKy.map(() => "<td><i>(Ký, ghi rõ họ tên)</i></td>").join("")}</tr>
      <tr>${table.chuKy.map((s) => `<td class="ten-nguoi-ky">${s.ten.length ? s.ten.map((name) => `<p>${esc(name)}</p>`).join("") : "&nbsp;"}</td>`).join("")}</tr>
    </tbody></table>
  </article>`;
}
export function keHoachThangHtml(raw: unknown) {
  const plan = docKeHoachThang(raw);
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Kế hoạch tháng</title><style>html,body{margin:0;padding:0;background:#fff}${cssKeHoachThang(plan)}</style></head><body>${noiDungHtmlThang(plan)}</body></html>`;
}

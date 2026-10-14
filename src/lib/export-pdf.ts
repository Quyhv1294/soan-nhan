import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";
import {
  DO_TUOI_LABEL,
  type GiaoAnMamNon,
  type KeHoachBaiDay,
  type KeHoachTuan,
  type PhieuHocTap,
} from "./types";
import { renderPhieuSvg } from "./phieu";
import { dongNguCanhGiaoAn } from "./ngu-canh-giao-an";
import { keHoachThangHtml } from "./ke-hoach-thang-html";
import { cauHinhTrangThang } from "./bang-ke-hoach-thang";
import { docKeHoachThang } from "./ke-hoach-thang";

// Xuất PDF: dựng HTML sạch (không phụ thuộc Tailwind) rồi cho Chrome in ra khổ A4.
// Bố cục theo đúng bản Word: font có chân, bảng kẻ đủ viền.

export class KhongCoChrome extends Error {}

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const ul = (items: string[]) => `<ul>${items.map((x) => `<li>- ${esc(x)}</li>`).join("")}</ul>`;

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Tinos, "Liberation Serif", serif; font-size: 13pt; line-height: 1.4; color: #000; margin: 0; }
  h1 { font-size: 16pt; text-align: center; margin: 0 0 2pt; }
  h2 { font-size: 13pt; margin: 12pt 0 3pt; }
  h3 { font-size: 13pt; font-style: italic; margin: 6pt 0 2pt; }
  p { margin: 0 0 3pt; }
  .giua { text-align: center; }
  .nghieng { font-style: italic; }
  ul { list-style: none; margin: 0; padding: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  th, td { border: 1px solid #000; padding: 4pt 6pt; vertical-align: top; text-align: left; }
  th { text-align: center; font-weight: bold; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  tbody.nhom { break-inside: avoid; }
`;

const trang = (body: string, css = "") =>
  `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>${CSS}${css}</style></head><body>${body}</body></html>`;

export function giaoAnHtml(ga: GiaoAnMamNon) {
  // Mỗi hoạt động là một <tbody> không bị cắt đôi, để dòng tiêu đề không rơi trơ trọi cuối trang.
  const rows = ga.tienHanh
    .map(
      (hd) =>
        `<tbody class="nhom"><tr><td colspan="3"><b>${esc(hd.ten)}</b></td></tr>` +
        hd.buoc.map((b) => `<tr><td>${esc(b.thoiGian)}</td><td>${ul(b.hoatDongCo)}</td><td>${ul(b.hoatDongTre)}</td></tr>`).join("") +
        `</tbody>`,
    )
    .join("");
  return trang(`
    <h1>GIÁO ÁN</h1>
    <p class="giua nghieng">Lĩnh vực: ${esc(ga.linhVuc)}</p>
    <p><b>Chủ đề:</b> ${esc(ga.chuDe)}</p>
    <p><b>Đề tài:</b> ${esc(ga.tenHoatDong)}</p>
    <p><b>Độ tuổi:</b> ${esc(DO_TUOI_LABEL[ga.doTuoi] ?? ga.doTuoi)}. <b>Thời gian:</b> ${esc(ga.thoiLuong)}</p>
    ${dongNguCanhGiaoAn(ga.nguCanhKeHoach).map((row) => `<p><b>${esc(row.nhan)}:</b> ${esc(row.noiDung).replace(/\n/g, "<br>")}</p>`).join("")}
    <h2>I. MỤC ĐÍCH, YÊU CẦU</h2>
    <h3>1. Kiến thức</h3>${ul(ga.mucDich.kienThuc)}
    <h3>2. Kỹ năng</h3>${ul(ga.mucDich.kyNang)}
    <h3>3. Thái độ</h3>${ul(ga.mucDich.thaiDo)}
    <h2>II. CHUẨN BỊ</h2>
    <h3>1. Đồ dùng của cô</h3>${ul(ga.chuanBi.cuaCo)}
    <h3>2. Đồ dùng của trẻ</h3>${ul(ga.chuanBi.cuaTre)}
    ${ga.chuanBi.diaDiem ? `<p><b><i>3. Địa điểm:</i></b> ${esc(ga.chuanBi.diaDiem)}</p>` : ""}
    <h2>III. TIẾN HÀNH</h2>
    <table>
      <thead><tr><th style="width:16%">Thời gian</th><th>Hoạt động của cô</th><th style="width:32%">Hoạt động của trẻ</th></tr></thead>
      ${rows}
    </table>`);
}

export function khbdHtml(k: KeHoachBaiDay) {
  const rows = k.hoatDong
    .map(
      (hd) =>
        `<tbody class="nhom"><tr><td colspan="2"><b>${esc(hd.ten)}</b> <i>Mục tiêu: ${esc(hd.mucTieu)}</i></td></tr>` +
        `<tr><td>${ul(hd.giaoVien)}</td><td>${ul(hd.hocSinh)}</td></tr></tbody>`,
    )
    .join("");
  return trang(`
    <h1>KẾ HOẠCH BÀI DẠY</h1>
    <p class="giua">Môn: ${esc(k.mon)}, lớp ${esc(k.lop)}. Bộ sách: ${esc(k.boSach)}</p>
    <p class="giua"><b>${esc(k.tenBai)}${k.tiet ? ` (${esc(k.tiet)})` : ""}</b></p>
    <h2>I. YÊU CẦU CẦN ĐẠT</h2>
    <h3>1. Năng lực đặc thù</h3>${ul(k.yeuCauCanDat.nangLucDacThu)}
    <h3>2. Năng lực chung</h3>${ul(k.yeuCauCanDat.nangLucChung)}
    <h3>3. Phẩm chất</h3>${ul(k.yeuCauCanDat.phamChat)}
    <h2>II. ĐỒ DÙNG DẠY HỌC</h2>
    <p><b>Giáo viên:</b> ${esc(k.doDung.giaoVien.join("; "))}</p>
    <p><b>Học sinh:</b> ${esc(k.doDung.hocSinh.join("; "))}</p>
    <h2>III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU</h2>
    <table>
      <thead><tr><th>Hoạt động của giáo viên</th><th style="width:40%">Hoạt động của học sinh</th></tr></thead>
      ${rows}
    </table>
    <h2>IV. ĐIỀU CHỈNH SAU BÀI DẠY</h2>
    <p>${esc(k.dieuChinh ?? "..........................................................................................................")}</p>`);
}

export function tuanHtml(t: KeHoachTuan) {
  const buoi = t.ngay[0]?.hoatDong.map((h) => h.buoi) ?? [];
  const rows = buoi
    .map(
      (b) =>
        `<tr><td><b>${esc(b)}</b></td>` +
        t.ngay
          .map((n) => {
            const hd = n.hoatDong.find((h) => h.buoi === b);
            return `<td>${hd ? `${esc(hd.ten)}${hd.linhVuc ? `<br><i class="nho">${esc(hd.linhVuc)}</i>` : ""}` : ""}</td>`;
          })
          .join("") +
        `</tr>`,
    )
    .join("");
  return trang(
    `
    <h1>KẾ HOẠCH TUẦN</h1>
    <p class="giua"><b>Chủ đề: ${esc(t.chuDe)}${t.nhanh ? ` — Nhánh: ${esc(t.nhanh)}` : ""}</b></p>
    <p class="giua">${esc(DO_TUOI_LABEL[t.doTuoi] ?? t.doTuoi)}. Từ ngày ${esc(new Date(t.tuNgay).toLocaleDateString("vi-VN", { timeZone: "UTC" }))}</p>
    <table class="tuan">
      <thead><tr><th style="width:12%">Hoạt động</th>${t.ngay.map((n) => `<th>${esc(n.thu)}</th>`).join("")}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`,
    `body { font-size: 11pt; } .nho { font-size: 9.5pt; }`,
  );
}

// Preview và PDF dùng cùng một bản vẽ, bao gồm hướng dẫn và từng bài tập.
export function phieuHtml(p: PhieuHocTap) {
  return trang(renderPhieuSvg(p));
}

export const PDF_HTML = {
  "giao-an": giaoAnHtml,
  khbd: khbdHtml,
  "ke-hoach-tuan": tuanHtml,
  "ke-hoach-thang": keHoachThangHtml,
  phieu: phieuHtml,
} as const;

export type LoaiPdf = keyof typeof PDF_HTML;

// Tìm Chrome/Edge có sẵn trên máy chủ. Đặt CHROME_PATH nếu cài ở chỗ khác.
function timChrome(): string {
  const ung = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const tim = ung.find((p) => p && existsSync(p));
  if (!tim) throw new KhongCoChrome("Không tìm thấy trình duyệt Chrome trên máy chủ.");
  return tim;
}

export async function htmlToPdf(html: string, o: { landscape?: boolean; margin?: string; format?: "Letter" | "A4"; preferCSSPageSize?: boolean } = {}): Promise<Uint8Array> {
  // Vercel uses a packaged Linux binary; local machines keep their installed browser.
  const chromium = process.env.VERCEL ? (await import("@sparticuz/chromium")).default : null;
  const browser = await puppeteer.launch(chromium ? {
    executablePath: await chromium.executablePath(),
    headless: "shell",
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
  } : { executablePath: timChrome(), headless: true, args: ["--disable-gpu"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 15000 });
    return await page.pdf({
      format: o.format ?? "A4",
      preferCSSPageSize: o.preferCSSPageSize,
      landscape: o.landscape,
      printBackground: true,
      margin: o.margin
        ? { top: o.margin, bottom: o.margin, left: o.margin, right: o.margin }
        : { top: "20mm", bottom: "20mm", left: "30mm", right: "15mm" }, // lề theo mẫu văn bản hành chính
    });
  } finally {
    await browser.close();
  }
}

export function xuatPdf(loai: LoaiPdf, data: unknown) {
  const html = (PDF_HTML[loai] as (d: unknown) => string)(data);
  if (loai === "ke-hoach-thang") return htmlToPdf(html, { landscape: true, format: cauHinhTrangThang(docKeHoachThang(data)).khoGiay, preferCSSPageSize: true, margin: "0mm" });
  if (loai === "ke-hoach-tuan") return htmlToPdf(html, { landscape: true, margin: "12mm" });
  if (loai === "phieu") return htmlToPdf(html, { margin: "12mm" });
  return htmlToPdf(html);
}

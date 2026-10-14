import { PHIEU_SO_LUONG, PHIEU_TIEU_DE, type MauPhieu, type PhieuHocTap } from "./types";
import { CHU_CAI_VIET, docPhieu } from "./mau-phieu";

export const MAU_PHIEU = Object.keys(PHIEU_TIEU_DE) as MauPhieu[];
export const laMauPhieu = (value: unknown): value is MauPhieu => MAU_PHIEU.includes(value as MauPhieu);

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const text = (x: number, y: number, value: string, size = 18, extra = "") => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(value)}</text>`;
function lines(value: string, max = 68): string[] {
  const result: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    if (line && (line + " " + word).length > max) { result.push(line); line = word; }
    else line += (line ? " " : "") + word;
  }
  if (line) result.push(line);
  return result;
}

type Shape = "circle" | "square" | "triangle" | "star" | "house" | "tree" | "flower" | "fish" | "car";
const LABEL: Record<Shape, string> = { circle: "Hình tròn", square: "Hình vuông", triangle: "Hình tam giác", star: "Ngôi sao", house: "Ngôi nhà", tree: "Cái cây", flower: "Bông hoa", fish: "Con cá", car: "Ô tô" };

function shapesFor(p: PhieuHocTap): Shape[] {
  const topic = `${p.chuDe} ${p.noiDung ?? ""}`.toLocaleLowerCase("vi");
  if (/hình|tròn|vuông|tam giác/.test(topic)) return ["circle", "square", "triangle", "star"];
  if (/gia đình|ngôi nhà|đồ dùng/.test(topic)) return ["house", "tree", "flower", "car"];
  if (/thiên nhiên|thực vật|cây|hoa/.test(topic)) return ["tree", "flower", "star", "circle"];
  if (/động vật|con vật|biển|cá/.test(topic)) return ["fish", "flower", "tree", "star"];
  if (/giao thông|xe|phương tiện/.test(topic)) return ["car", "circle", "triangle", "house"];
  return ["house", "flower", "fish", "tree"];
}

function shape(kind: Shape, x: number, y: number, size: number): string {
  const artwork: Record<Shape, string> = {
    circle: '<circle cx="50" cy="50" r="35"/>',
    square: '<rect x="18" y="18" width="64" height="64" rx="3"/>',
    triangle: '<path d="M50 12 89 83H11Z"/>',
    star: '<path d="m50 8 12 27 30 3-22 21 6 31-26-15-26 15 6-31L8 38l30-3Z"/>',
    house: '<path d="m9 44 41-32 41 32M21 36v49h58V36"/><path d="M43 85V60h17v25M29 47h12v12H29Z"/>',
    tree: '<path d="M43 62v27h15V62"/><path d="M27 67a17 17 0 0 1-9-31 20 20 0 0 1 35-15 20 20 0 0 1 30 20 17 17 0 0 1-11 27Z"/>',
    flower: '<path d="M50 58v34m0-13c-16 1-22-9-22-9 18-5 22 9 22 9Zm0 7c16 1 22-9 22-9-18-5-22 9-22 9Z"/><path d="M40 25c-5-24 25-24 20 0 23-12 32 16 7 19 20 16-4 34-17 14-13 20-37 2-17-14-25-3-16-31 7-19Z"/><circle cx="50" cy="39" r="10"/>',
    fish: '<path d="M70 48 92 25v49L70 52C43 91 10 63 9 50 10 37 43 9 70 48Z"/><circle cx="29" cy="44" r="3"/><path d="M43 27q-13 24 0 46M22 57h8"/>',
    car: '<path d="m11 58 9-21h38l16 21h13v20H11Z"/><path d="M25 42h29l10 16H19m21-16v16"/><circle cx="29" cy="78" r="10"/><circle cx="70" cy="78" r="10"/>',
  };
  return `<g transform="translate(${x} ${y}) scale(${size / 100})" fill="white" stroke="#26372f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${artwork[kind]}</g>`;
}

function coloring(shapes: Shape[]): string {
  return shapes.map((kind, i) => {
    const x = 62 + (i % 2) * 330, y = 220 + Math.floor(i / 2) * 330;
    return `<g data-exercise="color"><rect x="${x}" y="${y}" width="290" height="300" rx="12" fill="none" stroke="#d5ded7"/>${shape(kind, x + 50, y + 30, 190)}${text(x + 145, y + 262, LABEL[kind], 20, 'text-anchor="middle"')}</g>`;
  }).join("");
}

function matching(shapes: Shape[]): string {
  const order = [2, 0, 3, 1];
  return shapes.map((kind, i) => {
    const y = 218 + i * 166;
    return `<g data-exercise="match">${shape(kind, 80, y, 112)}<circle cx="240" cy="${y + 56}" r="5" fill="#26372f"/><circle cx="455" cy="${y + 56}" r="5" fill="#26372f"/>${text(488, y + 63, LABEL[shapes[order[i]]], 21)}</g>`;
  }).join("");
}

function counting(shapes: Shape[], range?: number): string {
  const counts = range ? [Math.max(1, range - 2), range, Math.max(1, range - 1), Math.ceil(range / 2)] : PHIEU_SO_LUONG;
  return counts.map((count, i) => {
    const y = 232 + i * 162;
    const choices = range ? [count, ...Array.from({ length: range }, (_, j) => j + 1).filter((n) => n !== count).slice(0, 2)] : [];
    const options = range ? [...choices.slice(i % 3), ...choices.slice(0, i % 3)] : i % 2 ? [count + 1, count - 1, count] : [count, count + 1, count - 1];
    return `<g data-exercise="count">${Array.from({ length: count }, (_, j) => range ? shape(shapes[i], 44 + (j % 5) * 76, y + Math.floor(j / 5) * 54, 51) : shape(shapes[i], 44 + j * 70, y + 15, 65)).join("")}${options.map((n, j) => `<circle cx="${493 + j * 76}" cy="${y + 52}" r="29" fill="white" stroke="#26372f" stroke-width="2"/>${text(493 + j * 76, y + 60, String(n), 26, 'text-anchor="middle"')}`).join("")}<path d="M45 ${y + 117}h655" stroke="#d5ded7" stroke-dasharray="6 6"/></g>`;
  }).join("");
}

function fillIn(): string {
  const tasks = [["1", "", "3", "", "5"], ["2", "4", "", "8", ""], ["A", "", "C", "", "E"], ["1", "2", "", "4", ""]];
  return tasks.map((row, i) => {
    const y = 248 + i * 158;
    return `<g data-exercise="fill">${text(52, y + 44, `${i + 1}.`, 22)}${row.map((value, j) => `<rect x="${108 + j * 111}" y="${y}" width="86" height="80" rx="8" fill="white" stroke="#26372f" stroke-width="2"${!value ? ' stroke-dasharray="5 4"' : ""}/>${value ? text(151 + j * 111, y + 51, value, 30, 'text-anchor="middle"') : ""}`).join("")}</g>`;
  }).join("");
}

function scene(x: number, different: boolean): string {
  return `<g transform="translate(${x} 270)" stroke="#26372f" stroke-width="2.5" stroke-linejoin="round" fill="white">
    <rect width="310" height="460" rx="10" stroke="#c2cec5"/>
    <path d="M10 374q140-30 290 0" fill="none"/>
    <circle cx="62" cy="62" r="${different ? 19 : 28}" fill="#fff3bd"/>
    <path d="m63 211 80-67 80 67M79 197v164h128V197" fill="#fff9eb"/>
    <path d="M126 361v-65h34v65"/>
    ${different ? '<circle cx="109" cy="246" r="16" fill="#e8f0fc"/>' : '<rect x="93" y="230" width="32" height="32" fill="#e8f0fc"/>'}
    ${!different ? '<path d="m143 165 6 12 14 2-10 9 2 14-12-7-12 7 2-14-10-9 14-2Z" fill="#fff3bd"/>' : ""}
    <path d="M247 276v95h16v-95"/>
    <path d="M213 290c-37-45 16-64 4-76-7-35 47-56 59-19 39 2 36 56 12 58 27 39-39 69-75 37Z" fill="#edf5e9"/>
    <circle cx="235" cy="244" r="9" fill="#f3d1c8"/><circle cx="274" cy="265" r="9" fill="#f3d1c8"/>
    ${!different ? '<circle cx="257" cy="217" r="9" fill="#f3d1c8"/>' : ""}
    <path d="M46 366v59m0-21q-25-1-23-17 24-2 23 17Z" fill="#edf5e9"/>
    ${!different ? '<path d="M46 414q25-1 23-17-24-2-23 17Z" fill="#edf5e9"/>' : ""}
    <circle cx="46" cy="354" r="17" fill="#f4dfeb"/><circle cx="46" cy="354" r="6" fill="#fff3bd"/>
  </g>`;
}

function tracing(): string {
  const paths = ["M90 55H650", "M90 90 150 20m30 70 60-70m30 70 60-70m30 70 60-70m30 70 60-70m30 70 60-70", "M90 70q35-75 70 0t70 0t70 0t70 0t70 0t70 0t70 0", "M90 85 145 20 200 85 255 20 310 85 365 20 420 85 475 20 530 85 585 20 640 85"];
  return paths.map((d, i) => `<g data-exercise="trace" transform="translate(0 ${235 + i * 160})">${text(44, 0, ["Nét ngang", "Nét xiên", "Nét cong", "Nét gấp khúc"][i], 20)}<path d="M75 18H670M75 92H670" stroke="#d5ded7" stroke-width="1"/><path d="${d}" fill="none" stroke="#69776d" stroke-width="3" stroke-dasharray="5 6" stroke-linecap="round"/></g>`).join("");
}

function letterSheet(letters: string[], trace: boolean): string {
  const rows = Array.from({ length: Math.max(4, letters.length) }, (_, i) => letters[i % letters.length]);
  return rows.map((target, i) => {
    const y = 252 + i * 108;
    if (trace) return `<g data-exercise="trace-letter">${text(60, y + 22, target, 58)}${Array.from({ length: 5 }, (_, j) => text(174 + j * 105, y + 22, target, 62, 'fill="none" stroke="#69776d" stroke-width="1.2" stroke-dasharray="3 3" text-anchor="middle"')).join("")}<path d="M135 ${y + 29}H680M135 ${y - 36}H680" stroke="#d5ded7"/></g>`;
    // Deliberately vary the positions, retaining at least two occurrences of the target.
    const items = Array.from({ length: 8 }, (_, j) => (j + i) % 3 === 0 ? target : CHU_CAI_VIET[(i * 7 + j * 3) % CHU_CAI_VIET.length]);
    return `<g data-exercise="find-letter">${text(47, y, `${target} →`, 30)}${items.map((c, j) => text(164 + j * 72, y, c, 34, 'text-anchor="middle"')).join("")}<path d="M44 ${y + 40}H700" stroke="#d5ded7" stroke-dasharray="5 5"/></g>`;
  }).join("");
}

const answerBox = (x: number, y: number, size = 62) => `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="8" fill="white" stroke="#26372f" stroke-width="2" stroke-dasharray="5 5"/>`;
function patterns(shapes: Shape[], pattern: "AB" | "AAB" | "ABB"): string {
  return Array.from({ length: 4 }, (_, i) => {
    const y = 244 + i * 158;
    return `<g data-exercise="pattern">${text(44, y + 37, `${i + 1}.`, 20)}${Array.from({ length: 8 }, (_, j) => j > 5 ? answerBox(80 + j * 76, y, 58) : shape(shapes[(i + (pattern[j % pattern.length] === "A" ? 0 : 1)) % shapes.length], 80 + j * 76, y, 58)).join("")}</g>`;
  }).join("");
}
function group(kind: Shape, count: number, x: number, y: number): string {
  return Array.from({ length: count }, (_, j) => shape(kind, x + (j % 5) * 43, y + Math.floor(j / 5) * 45, 41)).join("");
}
function comparison(shapes: Shape[], range: number): string {
  const counts = [[range, range - 1], [range - 2, range], [range - 1, range - 1], [range, Math.max(1, range - 2)]];
  return counts.map(([a, b], i) => {
    const y = 246 + i * 160;
    return `<g data-exercise="compare">${group(shapes[i], a, 55, y)}${answerBox(338, y + 9, 68)}${group(shapes[i], b, 475, y)}<path d="M44 ${y + 122}H700" stroke="#d5ded7"/></g>`;
  }).join("");
}
function splitting(shapes: Shape[], total: number): string {
  return Array.from({ length: 4 }, (_, i) => {
    const y = 232 + i * 164, known = 1 + (i % (total - 1));
    return `<g data-exercise="split">${text(44, y + 25, `${i + 1}. Tổng: ${total}`, 21)}${group(shapes[i], total, 242, y - 5)}<path d="M350 ${y + 85} 275 ${y + 111}m120-26 75 26" fill="none" stroke="#26372f" stroke-width="2"/><rect x="231" y="${y + 105}" width="62" height="48" rx="7" fill="white" stroke="#26372f"/>${text(262, y + 138, String(known), 28, 'text-anchor="middle"')}${answerBox(451, y + 105, 48)}</g>`;
  }).join("");
}
function arithmetic(shapes: Shape[], range: number): string {
  return Array.from({ length: 4 }, (_, i) => {
    const y = 240 + i * 164;
    const a = i === 0 ? Math.ceil(range / 2) : i === 1 ? range : i === 2 ? Math.max(1, range - 2) : range - 1;
    const b = i === 0 ? range - a : i === 1 ? Math.max(1, range - 2) : 1;
    const op = i % 2 ? "−" : "+";
    const left = i % 2 ? Array.from({ length: a }, (_, j) => `${shape(shapes[i], 55 + (j % 5) * 45, y + Math.floor(j / 5) * 45, 42)}${j < b ? `<path d="M${58 + (j % 5) * 45} ${y + 39 + Math.floor(j / 5) * 45}l34-34" stroke="#26372f" stroke-width="2"/>` : ""}`).join("") : `${group(shapes[i], a, 55, y)}${text(294, y + 51, "+", 28)}${group(shapes[i], b, 355, y)}`;
    return `<g data-exercise="arithmetic">${left}${text(320, y + 137, `${a} ${op} ${b} =`, 28)}${answerBox(455, y + 102, 48)}</g>`;
  }).join("");
}

function aiExercises(p: PhieuHocTap): string {
  const ai = p.baiTapAi!;
  if (p.mau === "to-mau") return ai.dong.map((d, i) => {
    const x = 62 + (i % 2) * 330, y = 220 + Math.floor(i / 2) * 330;
    return `<g data-exercise="ai-color"><rect x="${x}" y="${y}" width="290" height="300" rx="12" fill="none" stroke="#d5ded7"/>${lines(d.lenh, 28).map((s, j) => text(x + 145, y + 26 + j * 20, s, 16, 'text-anchor="middle"')).join("")}${shape(d.hinh!, x + 60, y + 65, 170)}${text(x + 145, y + 275, d.nhan!, 20, 'text-anchor="middle"')}</g>`;
  }).join("");
  if (p.mau === "tim-diem-khac") return `${text(205, 246, "Tranh A", 21, 'text-anchor="middle"')}${text(541, 246, "Tranh B", 21, 'text-anchor="middle"')}${[50, 385].map((x, panel) => `<g data-exercise="ai-differences"><rect x="${x}" y="270" width="310" height="550" rx="12" fill="none" stroke="#d5ded7"/>${ai.dong.map((d, i) => { const kind = panel ? d.hinhB : d.hinh; return kind && kind !== "khong" ? shape(kind, x + 25 + (i % 2) * 140, 292 + Math.floor(i / 2) * 174, 110) : ""; }).join("")}</g>`).join("")}${text(372, 876, "Bé đã tìm được: .......... / 5 điểm khác nhau", 20, 'text-anchor="middle"')}`;
  return ai.dong.map((d, i) => {
    const y = 230 + i * 168;
    let body = "";
    switch (p.mau) {
      case "noi-hinh": {
        const right = ai.dong[[2, 0, 3, 1][i]];
        body = `${shape(d.hinh!, 80, y + 18, 105)}<circle cx="240" cy="${y + 72}" r="5"/><circle cx="455" cy="${y + 72}" r="5"/>${text(488, y + 79, right.nhan!, 21)}`; break;
      }
      case "dem-khoanh": body = `${Array.from({ length: d.soLuong! }, (_, j) => shape(d.hinh!, 44 + (j % 5) * 76, y + 20 + Math.floor(j / 5) * 54, 51)).join("")}${d.luaChon!.map((n, j) => `<circle cx="${493 + j * 76}" cy="${y + 72}" r="29" fill="white" stroke="#26372f" stroke-width="2"/>${text(493 + j * 76, y + 80, String(n), 26, 'text-anchor="middle"')}`).join("")}`; break;
      case "dien-chu-so": body = d.day!.map((v, j) => `${answerBox(108 + j * 111, y + 25, 80)}${v ? text(148 + j * 111, y + 77, v, 30, 'text-anchor="middle"') : ""}`).join(""); break;
      case "to-net": {
        const paths = { ngang: "M90 65H650", xien: "M90 100 150 30m30 70 60-70m30 70 60-70m30 70 60-70m30 70 60-70m30 70 60-70", cong: "M90 80q35-75 70 0t70 0t70 0t70 0t70 0t70 0t70 0", "gap-khuc": "M90 95 145 30 200 95 255 30 310 95 365 30 420 95 475 30 530 95 585 30 640 95" };
        body = `<g transform="translate(0 ${y})"><path d="M75 28H670M75 102H670" stroke="#d5ded7"/><path d="${paths[d.net!]}" fill="none" stroke="#69776d" stroke-width="3" stroke-dasharray="5 6" stroke-linecap="round"/></g>`; break;
      }
      case "tim-chu": body = `${text(47, y + 70, `${d.chuMau} →`, 30)}${d.day!.map((c, j) => text(164 + j * 72, y + 70, c, 34, 'text-anchor="middle"')).join("")}`; break;
      case "to-chu": body = `${text(60, y + 85, d.chuMau!, 58)}${Array.from({ length: 5 }, (_, j) => text(174 + j * 105, y + 85, d.chuMau!, 62, 'fill="none" stroke="#69776d" stroke-width="1.2" stroke-dasharray="3 3" text-anchor="middle"')).join("")}<path d="M135 ${y + 92}H680M135 ${y + 27}H680" stroke="#d5ded7"/>`; break;
      case "quy-luat": {
        const pattern = p.tuyChinh?.quyLuat ?? "ABB";
        body = Array.from({ length: 8 }, (_, j) => j > 5 ? answerBox(80 + j * 76, y + 32, 58) : shape(pattern[j % pattern.length] === "A" ? d.hinh! : d.hinhB as Shape, 80 + j * 76, y + 32, 58)).join(""); break;
      }
      case "so-sanh": body = `${group(d.hinh!, d.benTrai!, 55, y + 25)}${answerBox(338, y + 34, 68)}${group(d.hinh!, d.benPhai!, 475, y + 25)}`; break;
      case "tach-gop": body = `${text(44, y + 57, `Tổng: ${d.tong}`, 21)}${group(d.hinh!, d.tong!, 242, y + 8)}<path d="M350 ${y + 94} 275 ${y + 117}m120-23 75 23" fill="none" stroke="#26372f" stroke-width="2"/><rect x="231" y="${y + 114}" width="62" height="42" rx="7" fill="white" stroke="#26372f"/>${text(262, y + 144, String(d.nhomMot), 28, 'text-anchor="middle"')}${answerBox(451, y + 114, 42)}`; break;
      case "cong-tru": {
        const a = d.a!, b = d.b!, subtract = d.phep === "-";
        body = subtract ? Array.from({ length: a }, (_, j) => `${shape(d.hinh!, 55 + (j % 5) * 45, y + 20 + Math.floor(j / 5) * 45, 42)}${j < b ? `<path d="M${58 + (j % 5) * 45} ${y + 59 + Math.floor(j / 5) * 45}l34-34" stroke="#26372f" stroke-width="2"/>` : ""}`).join("") : `${group(d.hinh!, a, 55, y + 20)}${text(294, y + 71, "+", 28)}${group(d.hinh!, b, 355, y + 20)}`;
        body += `${text(320, y + 145, `${a} ${subtract ? "−" : "+"} ${b} =`, 28)}${answerBox(455, y + 110, 45)}`; break;
      }
    }
    return `<g data-exercise="ai-${p.mau}">${text(44, y, d.lenh, 18)}${body}</g>`;
  }).join("");
}

/** One vector layout is used by the screen preview, browser printing and PDF export. */
export function renderPhieuSvg(p: PhieuHocTap): string {
  p = docPhieu(p);
  const instructions: Record<MauPhieu, string> = {
    "to-mau": "Tô màu các hình theo ý thích của bé.",
    "noi-hinh": "Nối mỗi hình ở bên trái với tên gọi đúng ở bên phải.",
    "dem-khoanh": "Đếm số hình ở mỗi dòng rồi khoanh vào số đúng.",
    "dien-chu-so": "Điền số hoặc chữ cái còn thiếu vào các ô trống.",
    "tim-diem-khac": "Tìm và khoanh 5 điểm khác nhau giữa hai bức tranh.",
    "to-net": "Tô theo nét đứt, sau đó tập vẽ lại trên giấy của bé.",
    "tim-chu": "Khoanh những chữ giống chữ mẫu ở đầu mỗi dòng.",
    "to-chu": "Quan sát chữ mẫu rồi tô theo nét viền của từng chữ.",
    "quy-luat": "Quan sát quy luật rồi vẽ hình tiếp theo vào ô trống.",
    "so-sanh": "Đếm hai nhóm hình rồi điền dấu >, < hoặc = vào ô.",
    "tach-gop": "Đếm tổng số hình, điền số còn thiếu của nhóm thứ hai.",
    "cong-tru": "Tính rồi điền số; hình gạch chéo là số được bớt đi.",
  };
  const shapes = shapesFor(p);
  const range = p.tuyChinh?.phamVi ?? 7, letters = p.tuyChinh?.chuCai ?? ["a", "ă", "â", "e", "ê"];
  const layouts: Record<MauPhieu, () => string> = {
    "to-mau": () => coloring(shapes), "noi-hinh": () => matching(shapes), "dem-khoanh": () => counting(shapes, p.tuyChinh?.phamVi), "dien-chu-so": fillIn,
    "tim-diem-khac": () => `${text(205, 246, "Tranh A", 21, 'text-anchor="middle"')}${text(541, 246, "Tranh B", 21, 'text-anchor="middle"')}<g data-exercise="differences">${scene(50, false)}${scene(385, true)}</g>${text(372, 802, "Bé đã tìm được: .......... / 5 điểm khác nhau", 20, 'text-anchor="middle"')}`,
    "to-net": tracing, "tim-chu": () => letterSheet(letters, false), "to-chu": () => letterSheet(letters, true),
    "quy-luat": () => patterns(shapes, p.tuyChinh?.quyLuat ?? "ABB"), "so-sanh": () => comparison(shapes, range), "tach-gop": () => splitting(shapes, range), "cong-tru": () => arithmetic(shapes, range),
  };
  const content = p.baiTapAi ? aiExercises(p) : layouts[p.mau]();
  const title = p.baiTapAi?.tieuDe ?? PHIEU_TIEU_DE[p.mau];
  const instruction = p.baiTapAi?.huongDan ?? instructions[p.mau];
  const subject = lines(`Chủ đề: ${p.chuDe || "Tự chọn"}`, 70).slice(0, 2);
  const notes = lines(p.noiDung ?? "", 77).slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 744 1052" role="img" aria-label="${esc(PHIEU_TIEU_DE[p.mau])}" style="display:block;width:100%;height:auto;background:white;font-family:Arial,'Segoe UI',sans-serif;color:#26372f" fill="#26372f" data-template="${p.mau}">
    <title>${esc(title)}</title><desc>${esc(instruction)}</desc>
    <rect width="744" height="1052" fill="white"/>
    ${text(44, 41, "Họ tên: .............................................", 17)}${text(548, 41, "Lớp: ...............", 17)}
    ${text(372, 99, title, p.baiTapAi ? 27 : 32, 'text-anchor="middle" font-weight="700"')}
    ${subject.map((line, i) => text(372, 134 + i * 21, line, 17, 'text-anchor="middle"')).join("")}
    ${p.baiTapAi ? lines(instruction, 68).map((s, i) => text(44, 183 + i * 22, s, 18)).join("") : text(44, 192, instruction, 19)}
    ${content}
    ${notes.map((line, i) => text(44, 955 + i * 23, line, 16)).join("")}
    ${text(372, 1020, "Bé làm bài thật vui nhé!", 15, 'text-anchor="middle" fill="#59665e"')}
  </svg>`;
}

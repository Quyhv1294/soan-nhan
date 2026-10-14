// Browser checks run in an isolated profile and intercept AI/storage requests.
// No real generation quota or user documents are used.
require('../tests/load-ts.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const puppeteer = require('puppeteer-core');
const { MOCK_GIAO_AN, MOCK_KHBD, MOCK_TUAN } = require('../src/lib/mock-data.ts');
const { MAU_PHIEU, renderPhieuSvg } = require('../src/lib/phieu.ts');
const { phieuHtml } = require('../src/lib/export-pdf.ts');

const base = process.env.UX_BASE_URL || 'http://localhost:3000';
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
const executablePath = candidates.find((file) => file && fs.existsSync(file));
if (!executablePath) throw new Error('Chrome/Edge is required for browser checks.');
// Keep screenshots outside the project while testing so Next's file watcher
// does not hot-reload the page halfway through an interaction.
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'soan-nhan-ux-'));
const reviewOutput = path.join(__dirname, '..', 'artifacts', 'ux-check');

async function clickButton(page, label) {
  for (const button of await page.$$('button')) {
    if ((await button.evaluate((el) => el.textContent.trim())) === label) {
      await button.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await button.click(); return;
    }
  }
  throw new Error(`Button missing: ${label}`);
}
async function setField(page, label, value) {
  await page.evaluate((label, value) => {
    const field = [...document.querySelectorAll('form[aria-label="Chỉnh sửa nội dung"] label')].find((el) => el.querySelector('span')?.textContent.trim() === label);
    const input = field?.querySelector('input,textarea');
    if (!input) throw new Error(`Field missing: ${label}`);
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, label, value);
}
async function waitText(page, value) {
  await page.waitForFunction((text) => document.body.innerText.includes(text), { timeout: 15000 }, value);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--disable-gpu'] });
  try {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
    const state = { failSave: false, failPlanSave: false, failGenerate: false, saves: [], generations: 0, exports: [] };
    const errors = [];
    page.on('pageerror', (error) => { errors.push(error.message); console.error('Browser error:', error.stack || error.message); });
    page.on('dialog', (dialog) => dialog.accept());
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      try {
        const url = new URL(request.url());
        const respond = (body, status = 200) => request.respond({ status, contentType: 'application/json', body: JSON.stringify(body) });
        if (url.origin !== new URL(base).origin && url.protocol.startsWith('http')) return request.abort();
        if (url.pathname === '/api/profile') return respond({ profile: null, demo: true });
        if (url.pathname === '/api/documents') {
          if (request.method() === 'GET') return respond({ documents: [], demo: true });
          const payload = JSON.parse(request.postData());
          state.saves.push(payload);
          await new Promise((resolve) => setTimeout(resolve, 250));
          return state.failSave || (state.failPlanSave && payload.loai === 'ke-hoach-tuan') ? respond({ error: 'Mạng lưu tạm thời bị gián đoạn.' }, 503) : respond({ ok: true, demo: true });
        }
        if (url.pathname === '/api/generate') {
          state.generations++;
          await new Promise((resolve) => setTimeout(resolve, 700));
          if (state.failGenerate) return respond({ error: 'AI tạm thời quá tải.' }, 503);
          const requestData = JSON.parse(request.postData());
          if (requestData.loai === 'tin-nhan') return respond({ data: `Kính gửi quý phụ huynh, đây là tin nhắn đã soạn lần ${state.generations}. Cô cùng gia đình chuẩn bị cho tuần học mới nhé.`, nguon: 'mau' });
          if (requestData.loai === 'ke-hoach-tuan') {
            const plan = structuredClone(MOCK_TUAN);
            plan.id = crypto.randomUUID(); plan.chuDe = requestData.input.chuDe;
            plan.ngay.forEach((day) => day.hoatDong.forEach((activity) => delete activity.giaoAnId));
            return respond({ data: plan, nguon: 'mau' });
          }
          const fixture = structuredClone(requestData.loai === 'khbd' ? MOCK_KHBD : MOCK_GIAO_AN);
          fixture.id = crypto.randomUUID();
          if (requestData.loai === 'khbd') fixture.tenBai = `Bản soạn mới ${state.generations}`;
          else fixture.tenHoatDong = `Bản soạn mới ${state.generations}`;
          return respond({ data: fixture, nguon: 'mau' });
        }
        if (url.pathname.startsWith('/api/export/')) {
          state.exports.push(JSON.parse(request.postData()));
          return request.respond({ status: 200, contentType: 'application/octet-stream', body: 'test-download' });
        }
        return request.continue();
      } catch (error) { errors.push(error.message); if (!request.isInterceptResolutionHandled()) await request.abort(); }
    });

    await page.goto(`${base}/phieu-hoc-tap`, { waitUntil: 'networkidle0' });
    for (const mau of MAU_PHIEU) {
      await page.$eval(`input[name="mau"][value="${mau}"]`, (el) => el.closest('label').click());
      await page.waitForSelector(`svg[data-template="${mau}"]`);
      await page.screenshot({ path: path.join(output, `phieu-${mau}.png`), fullPage: true });
      const svg = await page.$eval('.phieu-preview svg', (el) => el.outerHTML);
      assert.ok(svg.includes(`data-template="${mau}"`));
    }
    state.failSave = true;
    await clickButton(page, 'Lưu phiếu');
    await waitText(page, 'Mạng lưu tạm thời bị gián đoạn.');
    const worksheetGenerationCount = state.generations;
    state.failSave = false;
    await clickButton(page, 'Thử lưu lại');
    await waitText(page, 'Đã lưu phiếu vào thư viện.');
    assert.equal(state.generations, worksheetGenerationCount);
    const browserPrint = Buffer.from(await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true }));
    assert.equal((browserPrint.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length, 1, 'browser printing must produce only the worksheet, on one A4 page');
    fs.writeFileSync(path.join(output, 'phieu-browser-print.pdf'), browserPrint);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'worksheet should not overflow on mobile');
    await page.screenshot({ path: path.join(output, 'phieu-mobile.png'), fullPage: true });
    await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });

    // Print each shared SVG using the same A4/margin settings as the server exporter.
    const printPage = await context.newPage();
    for (const mau of MAU_PHIEU) {
      const worksheet = { mau, chuDe: 'Gia đình bé', noiDung: 'Cùng bé làm bài' };
      assert.ok(phieuHtml(worksheet).includes(renderPhieuSvg(worksheet)));
      await printPage.setContent(phieuHtml(worksheet), { waitUntil: 'load' });
      const pdf = Buffer.from(await printPage.pdf({ format: 'A4', printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } }));
      assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
      assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length, 1, `${mau} must fit one A4 page`);
      fs.writeFileSync(path.join(output, `phieu-${mau}.pdf`), pdf);
    }
    await printPage.close();
    console.log('PASS: five worksheet layouts, mobile width, five single-page PDFs');

    await page.goto(`${base}/giao-an/moi?id=${MOCK_GIAO_AN.id}`, { waitUntil: 'networkidle0' });
    const savesBeforeEdit = state.saves.length;
    await clickButton(page, 'Chỉnh sửa');
    await setField(page, 'Tên hoạt động', 'Giáo án đã chỉnh sửa');
    await clickButton(page, 'Hoàn tác');
    assert.equal(await page.$eval('form[aria-label="Chỉnh sửa nội dung"] input', (el) => el.value), MOCK_GIAO_AN.tenHoatDong);
    await clickButton(page, 'Làm lại');
    await setField(page, 'Kiến thức', 'Trẻ nhận biết hình theo yêu cầu mới.\nTrẻ giải thích lựa chọn của mình.');
    await clickButton(page, 'Hủy chỉnh sửa');
    assert.equal(state.saves.length, savesBeforeEdit, 'cancel must not save');
    assert.ok((await page.$eval('article', (el) => el.textContent)).includes(MOCK_GIAO_AN.tenHoatDong));

    await clickButton(page, 'Chỉnh sửa');
    await setField(page, 'Tên hoạt động', 'Giáo án đã chỉnh sửa');
    await setField(page, 'Kiến thức', 'Trẻ nhận biết hình theo yêu cầu mới.');
    await clickButton(page, 'Lưu thay đổi');
    await waitText(page, 'Đã lưu vào thư viện, bao gồm lịch sử phiên bản.');
    const firstSave = state.saves.at(-1).data;
    const stableId = firstSave.id;
    assert.equal(firstSave.tenHoatDong, 'Giáo án đã chỉnh sửa');
    assert.equal(firstSave._soanNhan.phienBan.length, 1);
    assert.equal(firstSave._soanNhan.phienBan[0].data.tenHoatDong, MOCK_GIAO_AN.tenHoatDong);
    assert.ok((await page.$eval('article', (el) => el.textContent)).includes('Trẻ nhận biết hình theo yêu cầu mới.'));
    await clickButton(page, 'Tải file Word');
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some((el) => el.textContent.trim() === 'Tải file Word'));
    assert.equal(state.exports.at(-1).data.tenHoatDong, 'Giáo án đã chỉnh sửa');

    await clickButton(page, 'Soạn lại');
    await waitText(page, 'Đang soạn nội dung');
    await waitText(page, 'Đang lưu vào thư viện');
    await waitText(page, 'Đã lưu vào thư viện, bao gồm lịch sử phiên bản.');
    assert.equal(state.saves.at(-1).data.id, stableId);
    assert.equal(state.saves.at(-1).data._soanNhan.phienBan.length, 2);
    await page.$eval('details summary', (el) => el.click());
    await page.click('button[aria-label="Khôi phục phiên bản 1"]');
    await waitText(page, 'Đã lưu vào thư viện, bao gồm lịch sử phiên bản.');
    assert.equal(state.saves.at(-1).data.tenHoatDong, 'Giáo án đã chỉnh sửa');
    assert.equal(state.generations, 1, 'restore must not call AI');
    await page.reload({ waitUntil: 'networkidle0' });
    await waitText(page, 'Giáo án đã chỉnh sửa');
    assert.ok((await page.$eval('article', (el) => el.textContent)).includes('Trẻ nhận biết hình theo yêu cầu mới.'));
    console.log('PASS: edit, undo, redo, cancel, export, regenerate, restore, reload history');

    state.failSave = true;
    await clickButton(page, 'Soạn lại');
    await waitText(page, 'Nội dung đã sẵn sàng nhưng chưa lưu được.');
    const attempts = state.generations;
    const unsaved = JSON.stringify(state.saves.at(-1).data);
    state.failSave = false;
    await clickButton(page, 'Thử lưu lại');
    await waitText(page, 'Đã lưu vào thư viện, bao gồm lịch sử phiên bản.');
    assert.equal(state.generations, attempts, 'retry must not call AI');
    assert.equal(JSON.stringify(state.saves.at(-1).data), unsaved, 'retry must use the same unsaved content');
    state.failGenerate = true;
    const beforeError = await page.$eval('article', (el) => el.textContent);
    await clickButton(page, 'Soạn lại');
    await waitText(page, 'AI tạm thời quá tải.');
    assert.equal(await page.$eval('article', (el) => el.textContent), beforeError);
    state.failGenerate = false;
    await page.screenshot({ path: path.join(output, 'giao-an-save-flow.png'), fullPage: true });
    console.log('PASS: save failure retry preserves content/quota; generation failure preserves prior document');

    await page.goto(`${base}/ke-hoach-bai-day?id=${MOCK_KHBD.id}`, { waitUntil: 'networkidle0' });
    await clickButton(page, 'Chỉnh sửa');
    await setField(page, 'Tên bài', 'KHBD đã chỉnh sửa');
    await setField(page, 'Năng lực đặc thù', 'Học sinh giải thích cách thực hiện phép tính.');
    await clickButton(page, 'Lưu thay đổi');
    await waitText(page, 'Đã lưu vào thư viện, bao gồm lịch sử phiên bản.');
    assert.equal(state.saves.at(-1).data.tenBai, 'KHBD đã chỉnh sửa');
    assert.ok((await page.$eval('article', (el) => el.textContent)).includes('Học sinh giải thích cách thực hiện phép tính.'));
    await clickButton(page, 'Chỉnh sửa');
    await page.screenshot({ path: path.join(output, 'khbd-editor.png'), fullPage: true });
    assert.deepEqual(errors, [], 'browser should not have runtime errors');
    console.log('PASS: KHBD editing and browser runtime');

    await page.goto(`${base}/ke-hoach-tuan`, { waitUntil: 'networkidle0' });
    await page.$eval('details summary', (el) => el.click());
    await page.type('input[name="chuDe"]', 'Tuần học thử nghiệm');
    state.failSave = true;
    await clickButton(page, 'Gợi ý kế hoạch 5 ngày');
    await waitText(page, 'Đã có nội dung nhưng chưa lưu đầy đủ vào thư viện.');
    const planCount = state.generations;
    state.failSave = false;
    await clickButton(page, 'Thử lưu lại');
    await waitText(page, 'Đã lưu lại nội dung và kế hoạch tuần.');
    assert.equal(state.generations, planCount);
    assert.ok((await page.$eval('h1', (el) => el.textContent)).includes('Tuần học thử nghiệm'));

    state.failPlanSave = true;
    await clickButton(page, 'Soạn cả 5 giáo án');
    await waitText(page, 'Đã có nội dung nhưng chưa lưu đầy đủ vào thư viện.');
    const failedBatchCount = state.generations;
    state.failPlanSave = false;
    await clickButton(page, 'Thử lưu lại');
    await waitText(page, 'Đã lưu lại nội dung và kế hoạch tuần.');
    assert.equal(state.generations, failedBatchCount, 'retry after saving a lesson but failing to save the plan must not regenerate');
    await clickButton(page, 'Soạn 4 giáo án còn lại');
    await waitText(page, 'Đã soạn xong 4 giáo án.');
    const planSave = state.saves.filter((x) => x.loai === 'ke-hoach-tuan').at(-1).data;
    const ids = planSave.ngay.map((day) => day.hoatDong.find((activity) => activity.buoi === 'Hoạt động học').giaoAnId);
    assert.equal(new Set(ids).size, 5, 'each lesson needs a unique saved ID');
    assert.ok(ids.every(Boolean));
    console.log('PASS: weekly plan retry, partial batch failure, retry without AI, remaining lessons');

    await page.goto(`${base}/tin-nhan-phu-huynh`, { waitUntil: 'networkidle0' });
    state.failSave = true;
    await clickButton(page, 'Soạn lại');
    await waitText(page, 'Cô giữ trang mở và thử lưu lại');
    const messageCount = state.generations;
    const message = await page.$eval('textarea', (el) => el.value);
    state.failSave = false;
    await clickButton(page, 'Thử lưu lại');
    await waitText(page, 'Đã lưu tin nhắn vào thư viện.');
    assert.equal(state.generations, messageCount);
    assert.equal(state.saves.at(-1).data.noiDung, message);
    assert.deepEqual(errors, []);
    console.log('PASS: parent-message save failure and retry without additional generation');
    await context.close();
  } finally { await browser.close(); }
  fs.mkdirSync(reviewOutput, { recursive: true });
  fs.cpSync(output, reviewOutput, { recursive: true });
  console.log(`Review artifacts: ${reviewOutput}`);
})().catch((error) => { console.error(error); process.exitCode = 1; });

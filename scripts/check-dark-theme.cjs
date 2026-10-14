// Review real rendered colors in an isolated browser; no AI calls or account writes.
require('../tests/load-ts.cjs');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const { MOCK_GIAO_AN, MOCK_KHBD } = require('../src/lib/mock-data.ts');
const base = process.env.UX_BASE_URL || 'http://localhost:3000';
const executablePath = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => p && fs.existsSync(p));
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'soan-nhan-dark-'));
const reviewOutput = path.join(__dirname, '..', 'artifacts', 'ux-check', 'dark-theme');

async function inspect(page) {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const rgba = value => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].map((v, i) => i === 3 ? v / 255 : v); };
    const over = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
    const lum = c => c.slice(0, 3).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((n, v, i) => n + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
    const bg = el => {
      const chain = []; for (let p = el; p; p = p.parentElement) chain.unshift(p);
      return chain.reduce((color, p) => over(rgba(getComputedStyle(p).backgroundColor), color), [255, 255, 255, 1]);
    };
    const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0 && !el.closest('[hidden],[inert],button:disabled,fieldset:disabled') && getComputedStyle(el).visibility !== 'hidden';
    const samples = [];
    const sample = (el, text, pseudo) => {
      if (!visible(el) || !text.trim()) return;
      const style = getComputedStyle(el, pseudo); let opacity = 1;
      for (let p = el; p; p = p.parentElement) opacity *= Number(getComputedStyle(p).opacity);
      if (opacity < 0.1) return;
      let background = bg(el);
      const highlight = el.closest('.gach-phan');
      if (highlight) { const s = getComputedStyle(highlight); const mark = rgba(s.getPropertyValue('--color-phan').trim()); mark[3] *= parseFloat(s.getPropertyValue('--do-dam-gach-phan') || '75') / 100; background = over(mark, background); }
      const color = rgba(style.color); color[3] *= opacity;
      const contrast = ratio(over(color, background), background);
      const size = parseFloat(style.fontSize); const large = size >= 24 || (size >= 18.667 && Number(style.fontWeight) >= 700);
      samples.push({ text: text.trim().slice(0, 85), tag: el.tagName, classes: el.className, color: style.color, background: background.slice(0, 3).map(Math.round), ratio: +contrast.toFixed(3), required: large ? 3 : 4.5, pass: contrast >= (large ? 3 : 4.5), gradient: Boolean(el.closest('.bang-phan,.o-ly,.gach-phan')) });
    };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node; node = walker.nextNode();) if (!node.parentElement.closest('script,style,svg,option,nextjs-portal')) sample(node.parentElement, node.textContent);
    for (const el of document.querySelectorAll('input,textarea')) sample(el, el.value || el.placeholder, el.value ? undefined : '::placeholder');
    const controls = [...document.querySelectorAll('input:not([type=radio]),textarea,select')].filter(visible).map(el => ({ name: el.name, border: getComputedStyle(el).borderColor, ratio: +ratio(rgba(getComputedStyle(el).borderColor), bg(el)).toFixed(3) }));
    const tokens = getComputedStyle(document.documentElement);
    const pair = (a, b) => +ratio(rgba(tokens.getPropertyValue(a).trim()), rgba(tokens.getPropertyValue(b).trim())).toFixed(3);
    return { theme: document.documentElement.dataset.theme, samples: samples.length, failures: samples.filter(x => !x.pass), controls, keyRatios: { body: pair('--color-muc', '--color-trang'), muted: pair('--color-muc-nhat', '--color-trang'), primary: pair('--color-tren-bang', '--color-bang') }, overflow: document.documentElement.scrollWidth > innerWidth, bodyBackground: getComputedStyle(document.body).backgroundColor, paper: [...document.querySelectorAll('.trang-van-ban,.phieu-preview')].map(el => ({ background: getComputedStyle(el).backgroundColor, text: getComputedStyle(el).color })) };
  });
}

(async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--disable-gpu'] });
  const errors = []; const results = [];
  let completed = false;
  try {
    const context = await browser.createBrowserContext(); const page = await context.newPage();
    const preload = await page.evaluateOnNewDocument(() => { localStorage.setItem('soan-nhan:giao-dien', 'dark'); localStorage.setItem('soan-nhan:ho-so', JSON.stringify({ capHoc: 'mam-non', doTuoi: 'Mẫu giáo nhỡ (4–5 tuổi)', boSach: 'Không áp dụng', tenLop: 'Lớp demo' })); });
    page.on('pageerror', error => { errors.push(error.message); console.error('PAGE_ERROR', error.stack); });
    // Mock read APIs only; forbid generation and server mutations during this review.
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin !== new URL(base).origin && /^https?:/.test(url.protocol)) return request.abort();
      if (url.pathname === '/api/profile') return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ demo: true, profile: null }) });
      if (url.pathname === '/api/documents' && request.method() === 'GET') return request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ demo: true, documents: [] }) });
      if (url.pathname.startsWith('/api/') && request.method() !== 'GET') return request.abort();
      return request.continue();
    });
    const routes = [
      ['overview', '/tong-quan'], ['editor', '/giao-an/moi'], ['lesson', `/giao-an/moi?id=${MOCK_GIAO_AN.id}`], ['primary', `/ke-hoach-bai-day?id=${MOCK_KHBD.id}`],
      ['worksheet', '/phieu-hoc-tap'], ['account', '/tai-khoan'], ['library', '/thu-vien'], ['week', '/ke-hoach-tuan'], ['message', '/tin-nhan-phu-huynh'], ['login', '/dang-nhap'], ['onboarding', '/bat-dau'], ['home', '/'],
    ];
    for (const [name, route] of routes) {
      await page.setViewport({ width: 1440, height: 1050, deviceScaleFactor: 1 });
      await page.goto(base + route, { waitUntil: 'networkidle2', timeout: 60000 });
      await page.waitForFunction(() => ![...document.querySelectorAll('button')].some(el => el.getAttribute('aria-label')?.includes('giao diện') && el.disabled), { timeout: 15000 });
      const report = await inspect(page); results.push({ name, viewport: 'desktop', ...report });
      assert.ok(report.paper.every(p => p.background === 'rgb(255, 255, 255)'), 'Document preview background must stay white');
      await page.screenshot({ path: path.join(output, `${name}-desktop.png`), fullPage: true });
      console.log(JSON.stringify({ page: name, samples: report.samples, failures: report.failures, controls: report.controls, keyRatios: report.keyRatios, overflow: report.overflow }));
      if (['overview', 'editor', 'account', 'worksheet'].includes(name)) {
        await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
        await page.screenshot({ path: path.join(output, `${name}-mobile.png`), fullPage: true });
        results.push({ name, viewport: 'mobile', ...await inspect(page) });
      }
      if (name === 'lesson') {
        const menu = await page.$('button[popovertarget]'); await menu.click();
        await page.waitForSelector('[popover]:popover-open');
        results.push({ name: 'document-menu', viewport: 'desktop', ...await inspect(page) });
        await page.screenshot({ path: path.join(output, 'document-menu.png'), fullPage: true });
        await page.keyboard.press('Escape');
      }
    }
    await page.removeScriptToEvaluateOnNewDocument(preload.identifier);
    await page.goto(base + '/tai-khoan', { waitUntil: 'networkidle2' });
    await page.evaluate(() => { [...document.querySelectorAll('button')].find(el => el.textContent.trim() === 'Sáng').click(); });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.reload({ waitUntil: 'networkidle2' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'light');
    await page.evaluate(() => { [...document.querySelectorAll('button')].find(el => el.textContent.trim() === 'Tối').click(); });
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await page.evaluate(() => { if (localStorage.getItem('soan-nhan:giao-dien') !== 'dark') throw new Error('Theme not persisted'); });
    await page.reload({ waitUntil: 'networkidle2' });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark');
    const secondTab = await context.newPage();
    await secondTab.goto(base + '/tai-khoan', { waitUntil: 'networkidle2' });
    await page.evaluate(() => [...document.querySelectorAll('button')].find(el => el.textContent.trim() === 'Sáng').click());
    await secondTab.waitForFunction(() => document.documentElement.dataset.theme === 'light');
    await page.evaluate(() => [...document.querySelectorAll('button')].find(el => el.textContent.trim() === 'Tối').click());
    await secondTab.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await secondTab.close();
    await page.goto(base + `/giao-an/moi?id=${MOCK_GIAO_AN.id}`, { waitUntil: 'networkidle2' });
    await page.emulateMediaType('print');
    const print = await inspect(page); assert.equal(print.bodyBackground, 'rgb(255, 255, 255)');
    assert.ok(print.paper.length > 0 && print.paper.every(p => p.background === 'rgb(255, 255, 255)' && p.text === 'rgb(29, 36, 51)'), 'Printed document must use dark ink on white paper');
    assert.equal(errors.length, 0, errors.join('\n'));
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ results, errors }, null, 2));
    console.log('REVIEW_OUTPUT', output);
    const failures = results.reduce((n, item) => n + item.failures.length, 0);
    console.log(JSON.stringify({ reviewed: results.length, contrastFindings: failures, errors: errors.length, printWhite: true, themePersistence: true, crossTabSync: true }));
    if (process.env.DARK_THEME_STRICT === '1' || process.argv.includes('--strict')) {
      assert.equal(failures, 0, 'Text contrast findings remain; inspect report.json.');
      assert.ok(results.every(item => !item.overflow), 'Horizontal overflow detected.');
      assert.ok(results.every(item => item.controls.every(control => control.ratio >= 3)), 'Form boundaries need at least 3:1 contrast.');
    }
    completed = true;
  } finally {
    await browser.close();
    if (completed) {
      // Copy only after Chrome closes, so Next's watcher cannot interrupt this run.
      fs.mkdirSync(reviewOutput, { recursive: true });
      fs.cpSync(output, reviewOutput, { recursive: true });
      console.log('REVIEW_ARTIFACTS', reviewOutput);
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

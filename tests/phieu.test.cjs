require('./load-ts.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderPhieuSvg, MAU_PHIEU } = require('../src/lib/phieu.ts');
const { phieuHtml } = require('../src/lib/export-pdf.ts');

test('each worksheet has its own exercise layout, not just a different heading', () => {
  const kinds = ['color', 'match', 'count', 'fill', 'differences', 'trace', 'find-letter', 'trace-letter', 'pattern', 'compare', 'split', 'arithmetic'];
  MAU_PHIEU.forEach((mau, i) => {
    const svg = renderPhieuSvg({ mau, chuDe: 'Gia đình bé' });
    assert.ok(svg.includes(`data-template="${mau}"`));
    assert.ok(svg.includes(`data-exercise="${kinds[i]}"`));
    for (const kind of kinds.filter((x) => x !== kinds[i])) assert.ok(!svg.includes(`data-exercise="${kind}"`));
  });
});

test('user text is escaped and cannot inject SVG tags or events', () => {
  const svg = renderPhieuSvg({ mau: 'to-mau', chuDe: '<script>alert(1)</script>', noiDung: '<image onerror="alert(1)"/>' });
  assert.ok(!svg.includes('<script>'));
  assert.ok(!svg.includes('<image'));
  assert.ok(svg.includes('&lt;script&gt;'));
});

test('counting has four tasks with three unanswered options each', () => {
  const svg = renderPhieuSvg({ mau: 'dem-khoanh', chuDe: 'Hình học' });
  assert.equal((svg.match(/data-exercise="count"/g) ?? []).length, 4);
  assert.equal((svg.match(/r="29"/g) ?? []).length, 12);
  assert.ok(!svg.includes('#c2352b'));
});

test('matching and fill-in provide space for answers, and unknown templates fail', () => {
  const matching = renderPhieuSvg({ mau: 'noi-hinh', chuDe: '' });
  assert.equal((matching.match(/data-exercise="match"/g) ?? []).length, 4);
  const fill = renderPhieuSvg({ mau: 'dien-chu-so', chuDe: '' });
  assert.equal((fill.match(/stroke-dasharray="5 4"/g) ?? []).length, 8);
  assert.throws(() => renderPhieuSvg({ mau: 'invalid', chuDe: '' }), TypeError);
});

test('all PDF templates embed exactly the same SVG as the screen preview', () => {
  for (const mau of MAU_PHIEU) {
    const worksheet = { mau, chuDe: 'Gia đình bé', noiDung: 'Cùng bé làm bài' };
    assert.ok(phieuHtml(worksheet).includes(renderPhieuSvg(worksheet)));
  }
});

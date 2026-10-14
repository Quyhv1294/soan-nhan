require('./load-ts.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { suaTruong, chuanHoaNoiDung, giuIdTaiLieu, themPhienBan, dongGoiBanSoan, docBanSoan } = require('../src/lib/ban-soan.ts');
const { luuTaiLieu } = require('../src/lib/kho-local.ts');
const { MOCK_GIAO_AN, MOCK_KHBD } = require('../src/lib/mock-data.ts');
const { XUAT_DOCX } = require('../src/lib/export-docx.ts');
const JSZip = require('jszip');
const id = 'da1db6d4-3569-4d3a-8563-8421f7363041';

test('editing a nested field never mutates the document or previous version', () => {
  const original = structuredClone(MOCK_GIAO_AN);
  const edited = suaTruong(original, ['tienHanh', 0, 'buoc', 0, 'hoatDongCo'], ['Nội dung mới']);
  assert.deepEqual(original, MOCK_GIAO_AN);
  assert.deepEqual(edited.tienHanh[0].buoc[0].hoatDongCo, ['Nội dung mới']);
  assert.notEqual(edited.tienHanh[0], original.tienHanh[0]);
});

test('regeneration and restoration preserve the current document ID', () => {
  assert.equal(giuIdTaiLieu({ id: crypto.randomUUID(), title: 'New' }, { id }).id, id);
  assert.equal(giuIdTaiLieu({ id: 'sample-id' }, { id }).id, id);
  assert.match(giuIdTaiLieu({ id: 'sample-id' }).id, /^[0-9a-f-]{36}$/);
});

test('saved history is bounded and does not recursively nest metadata', () => {
  let history = [];
  for (let i = 0; i < 9; i++) history = themPhienBan(history, { id, title: `Version ${i}`, _soanNhan: { phienBan: history } }, 'ai', 'Before editing');
  const saved = dongGoiBanSoan({ id, title: 'Current' }, history, 'chinh-sua');
  const read = docBanSoan(saved);
  assert.equal(read.phienBan.length, 5);
  assert.equal(read.phienBan[0].data.title, 'Version 8');
  assert.ok(read.phienBan.every((item) => !('_soanNhan' in item.data)));
  assert.ok(!('_soanNhan' in read.data));
  assert.equal(read.nguon, 'chinh-sua');
});

test('blank list lines are removed at commit without losing meaningful content', () => {
  assert.deepEqual(chuanHoaNoiDung({ id, list: [' first ', '', 'second ', '  '], optional: '  ' }), { id, list: ['first', 'second'], optional: '' });
});

test('saving retries only the documents endpoint and reports local storage failure', async () => {
  const originalFetch = global.fetch;
  const originalStorage = global.localStorage;
  const calls = [];
  try {
    global.fetch = async (url) => {
      calls.push(url);
      return calls.length === 1 ? new Response(JSON.stringify({ error: 'temporary failure' }), { status: 503 }) : new Response(JSON.stringify({ ok: true, demo: true }));
    };
    const entries = new Map();
    global.localStorage = { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
    const document = { id, tenBai: 'Edited lesson' };
    await assert.rejects(luuTaiLieu('khbd', document), /temporary failure/);
    assert.equal(await luuTaiLieu('khbd', document), id);
    assert.deepEqual(calls, ['/api/documents', '/api/documents']);
    global.localStorage.setItem = () => { throw new Error('quota exceeded'); };
    await assert.rejects(luuTaiLieu('khbd', document), /Trình duyệt không lưu được/);
  } finally { global.fetch = originalFetch; global.localStorage = originalStorage; }
});

test('Word export includes the edited lesson fields for both document formats', async () => {
  const ga = suaTruong(MOCK_GIAO_AN, ['mucDich', 'kienThuc'], ['Kiến thức đã chỉnh sửa']);
  const k = suaTruong(MOCK_KHBD, ['yeuCauCanDat', 'nangLucDacThu'], ['Năng lực đã chỉnh sửa']);
  for (const [type, document, expected] of [['giao-an', ga, 'Kiến thức đã chỉnh sửa'], ['khbd', k, 'Năng lực đã chỉnh sửa']]) {
    const archive = await JSZip.loadAsync(await XUAT_DOCX[type](document));
    const xml = await archive.file('word/document.xml').async('string');
    assert.ok(xml.includes(expected));
  }
});

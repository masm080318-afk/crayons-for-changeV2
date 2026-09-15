import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { pricingActive, published, validateContent, escapeHTML, safeURL } from './content.mjs';
const data = JSON.parse(await readFile(new URL('../data/content.json', import.meta.url), 'utf8'));

test('approved content validates and unconfirmed sections remain unpublished', () => {
  validateContent(data);
  for (const section of ['projects', 'timeline', 'reports', 'financialRecords']) assert.equal(published(data.impact[section]).length, 0);
  assert.equal(data.organization.team.length, 0);
  assert.equal(data.organization.story.length, 0);
  assert.equal(data.impact.studentsApproximate, true);
});
test('early bird pricing ends at midnight Pacific, including cached-page dates', () => {
  assert.equal(pricingActive(data.programs.winterYbf.pricing, new Date('2026-09-15T06:59:59Z')), true);
  assert.equal(pricingActive(data.programs.winterYbf.pricing, new Date('2026-09-15T07:00:00Z')), false);
  assert.equal(pricingActive(data.programs.winterYbf.pricing, new Date('2026-10-01T00:00:00Z')), false);
});
test('draft projects cannot accidentally publish and live records require evidence fields', () => {
  assert.equal(published([{ title: 'Internal draft' }, { published: false }]).length, 0);
  const invalid = structuredClone(data);
  invalid.impact.projects = [{ title: 'Draft', slug: 'draft', published: true }];
  assert.throws(() => validateContent(invalid), /Published project needs/);
});
test('content text and links are escaped, unsafe links rejected', () => {
  assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.throws(() => safeURL('javascript:alert(1)'), /Unsafe URL/);
  assert.throws(() => safeURL('//untrusted.example'));
  assert.equal(safeURL('/impact/'), '/impact/');
});
test('current program schedule contains ten Saturdays', () => {
  let count = 0;
  for (let d = new Date(`${data.programs.winterYbf.startDate}T12:00:00Z`); d <= new Date(`${data.programs.winterYbf.lastClassDate}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 7)) {
    assert.equal(d.getUTCDay(), 6);
    count++;
  }
  assert.equal(count, 10);
});

test('browser pricing code removes expired offers on restored tabs', async () => {
  const source = await readFile(new URL('../assets/site.js', import.meta.url), 'utf8');
  let now = '2026-09-15T06:59:59Z';
  const offers = { hidden: true, dataset: { endDate: '2026-09-14', timeZone: 'America/Los_Angeles' } };
  const fallback = { hidden: false };
  const listeners = {};
  runInNewContext(source, {
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: selector => ({ '[data-early-bird]': offers, '[data-current-pricing]': fallback }[selector] ?? null),
      addEventListener() {}
    },
    window: { addEventListener: (name, callback) => { (listeners[name] ||= []).push(callback); } },
    matchMedia: () => ({ addEventListener() {} }),
    setInterval() {}, Intl,
    Date: class extends Date { constructor() { super(now); } }
  });
  assert.equal(offers.hidden, false);
  assert.equal(fallback.hidden, true);
  now = '2026-09-15T07:00:00Z';
  listeners.pageshow.forEach(callback => callback());
  assert.equal(offers.hidden, true);
  assert.equal(fallback.hidden, false);
});

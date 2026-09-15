export function escapeHTML(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export function safeURL(value) {
  if (typeof value !== 'string') throw new Error('A link URL is required');
  if (/^\/(?!\/)/.test(value) || /^#[a-z]/i.test(value)) return value;
  const url = new URL(value);
  if (!['https:', 'mailto:'].includes(url.protocol)) throw new Error(`Unsafe URL: ${value}`);
  return value;
}
export function localDate(now, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function pricingActive(pricing, now = new Date()) {
  return localDate(now, pricing.timeZone) <= pricing.earlyBirdEndsOn && pricing.earlyBird.length > 0;
}
export function published(records = []) { return records.filter(record => record.published === true); }
export function validateContent(data) {
  const { impact, programs, organization } = data;
  for (const key of ['suppliesDistributed', 'studentsSupported']) {
    if (!Number.isInteger(impact[key]) || impact[key] < 0) throw new Error(`Invalid impact metric: ${key}`);
  }
  for (const url of [organization.donationUrl, organization.instagram, programs.winterYbf.registrationUrl]) safeURL(url);
  for (const p of published(impact.projects)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) throw new Error('Invalid project slug');
    for (const key of ['title', 'date', 'location', 'category', 'summary']) if (!p[key]) throw new Error(`Published project needs ${key}`);
    if (!p.coverImage?.src || !p.coverImage?.alt) throw new Error('Published project needs a photo and alt text');
    for (const key of ['studentsSupported', 'suppliesDistributed']) if (p[key] != null && (!Number.isInteger(p[key]) || p[key] < 0)) throw new Error(`Invalid project metric: ${key}`);
  }
  if (new Set(published(impact.projects).map(p => p.slug)).size !== published(impact.projects).length) throw new Error('Duplicate project slugs');
}

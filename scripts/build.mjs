import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { escapeHTML as e, safeURL, published, validateContent } from './content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(resolve(root, 'data/content.json'), 'utf8'));
validateContent(data);
const { organization: org, impact, programs, photos } = data;
const ybf = programs.winterYbf;
const cssVersion = createHash('sha256').update(await readFile(resolve(root, 'assets/site.css'))).digest('hex').slice(0, 10);
const jsVersion = createHash('sha256').update(await readFile(resolve(root, 'assets/site.js'))).digest('hex').slice(0, 10);
const navigation = [['About', '/about/'], ['Our Work', '/programs/'], ['Impact', '/impact/'], ['Get Involved', '/get-involved/'], ['Contact', '/contact/']];
const h = value => e(safeURL(value));
const arrow = '<span aria-hidden="true">&rarr;</span>';
const button = (label, url, kind = 'primary') => `<a class="button button-${kind}" href="${h(url)}">${e(label)} ${arrow}</a>`;
const textLink = (label, url) => `<a class="text-link" href="${h(url)}">${e(label)} ${arrow}</a>`;
const paragraphs = lines => lines.map(line => `<p>${e(line)}</p>`).join('');
const date = (value, year = false) => new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', ...(year ? { year: 'numeric' } : {}), timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
const time = () => {
  if (!ybf.meetingTimeConfirmed) return '';
  const [hour, minute] = ybf.meetingTime.split(':').map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'} Pacific Time`;
};
const schedule = () => `${ybf.weekday}s${time() ? ` at ${time()}` : ''}, ${date(ybf.startDate, true)} through ${date(ybf.lastClassDate, true)}.`;
const totalsSentence = () => `So far, C4C has supported ${impact.studentsApproximate ? 'approximately ' : ''}${impact.studentsSupported} students and distributed ${impact.suppliesDistributed} school supplies through its projects, with additional initiatives underway.`;
function photo(key, { eager = false, sizes = '(max-width: 700px) 100vw, 50vw', className = '' } = {}) {
  const p = photos[key];
  return `<img class="${e(className)}" src="/assets/${e(p.file)}-1000.webp" srcset="/assets/${e(p.file)}-640.webp 640w, /assets/${e(p.file)}-1000.webp 1000w, /assets/${e(p.file)}-1600.webp 1600w" sizes="${e(sizes)}" width="${p.width}" height="${p.height}" alt="${e(p.alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
}
function brand() {
  return `<a class="brand" href="/" aria-label="Crayons for Change home"><img src="/assets/logo.png" width="62" height="48" alt=""><span>Crayons<br>for Change</span></a>`;
}
function nav(path) {
  return `<header class="site-header"><div class="wrap nav-inner">${brand()}<nav class="navigation" id="navigation" aria-label="Main navigation">${navigation.map(([name, url]) => `<a href="${url}"${path.startsWith(url) ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav><a class="button button-primary nav-donate" href="${h(org.donationUrl)}">Donate</a><button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="navigation" aria-expanded="false"><span></span><span></span><span></span></button></div></header>`;
}
function footer() {
  return `<footer class="site-footer"><div class="wrap footer-grid"><div>${brand()}<p>${e(org.shortMission)}</p></div><nav aria-label="Footer navigation">${navigation.map(([name, url]) => `<a href="${url}">${name}</a>`).join('')}<a href="${h(org.donationUrl)}">Donate</a></nav><div class="footer-connect"><h2>Connect</h2><a href="mailto:${e(org.email)}">${e(org.email)}</a><a href="${h(org.instagram)}">Instagram ${arrow}</a></div></div><div class="wrap footer-bottom"><span>&copy; 2026 ${e(org.name)}.</span><span>${e(org.location)}</span></div></footer>`;
}
function shell(path, title, description, content, className = '', noindex = false) {
  const structured = JSON.stringify({ '@context': 'https://schema.org', '@type': 'NGO', name: org.name, url: org.url, description: org.mission, nonprofitStatus: 'Nonprofit501c3', logo: `${org.url}/assets/logo.png`, email: org.email, sameAs: [org.instagram] }).replace(/</g, '\\u003c');
  const hash = createHash('sha256').update(structured).digest('base64');
  const fullTitle = path === '/' ? `${org.name} | Educational Access` : `${title} | ${org.name}`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(fullTitle)}</title><meta name="description" content="${e(description)}">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; script-src 'self' 'sha256-${hash}'; style-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action mailto:">
<meta name="referrer" content="strict-origin-when-cross-origin"><meta name="theme-color" content="#ffffff">
${noindex ? '<meta name="robots" content="noindex">' : ''}<link rel="canonical" href="${org.url}${path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${e(org.name)}"><meta property="og:title" content="${e(fullTitle)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${org.url}${path}"><meta property="og:image" content="${org.url}/assets/social.jpg"><meta property="og:image:alt" content="Students holding Crayons for Change school supply bags"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.png?v=2" type="image/png"><link rel="apple-touch-icon" href="/favicon.png?v=2"><link rel="stylesheet" href="/assets/site.css?v=${cssVersion}"><script src="/assets/site.js?v=${jsVersion}" defer></script><script type="application/ld+json">${structured}</script></head>
<body class="${e(className)}"><a class="skip-link" href="#main">Skip to content</a>${nav(path)}<main id="main">${content}</main>${footer()}</body></html>`;
}
function heading(title, intro = '', label = '') {
  return `<section class="page-heading wrap">${label ? `<p class="eyebrow">${e(label)}</p>` : ''}<h1>${e(title)}</h1>${intro ? `<p class="lead">${e(intro)}</p>` : ''}</section>`;
}
function metrics({ title = true, link = false } = {}) {
  return `<section class="impact-band" id="numbers" aria-label="C4C impact"><div class="wrap impact-inner${title ? ' impact-with-title' : ''}">${title ? `<div class="impact-intro"><h2>Our impact so far</h2>${link ? textLink('See Our Impact', '/impact/') : ''}</div>` : ''}<dl class="metrics"><div><dt>School supplies distributed</dt><dd><span class="metric-value">${impact.suppliesDistributed.toLocaleString('en-US')}</span></dd></div><div><dt>Students supported</dt><dd>${impact.studentsApproximate ? '<span class="approximate">Approximately</span>' : ''}<span class="metric-value">${impact.studentsSupported.toLocaleString('en-US')}</span></dd></div></dl>${!title && link ? textLink('See Our Impact', '/impact/') : ''}</div></section>`;
}
function programIdentity() {
  return `<div class="program-identity" aria-hidden="true"><img src="/assets/logo.png" width="124" height="96" alt=""><span>Winter Youth<br>Business Fair</span></div>`;
}
function featuredProgram() {
  return `<section class="section section-tint"><div class="wrap feature-program"><div><p class="eyebrow">Current program</p><h2>${e(ybf.title)}</h2><p>${e(ybf.summary)}</p><p>${e(schedule())} Virtual Youth Business Fair on ${date(ybf.fairDate)}.</p><div class="button-row">${button('Register for the Winter YBF', ybf.registrationUrl)}${textLink('Program details', ybf.path)}</div></div><div class="program-dates"><div><span>Online classes begin</span><strong>${date(ybf.startDate)}</strong></div><div><span>Virtual Youth Business Fair</span><strong>${date(ybf.fairDate)}</strong></div></div></div></section>`;
}
function donationBand(label = 'Donate') {
  return `<section class="section support-band"><div class="wrap support-inner"><div><h2>Support educational access.</h2><p>${e(org.donationExplanation)}</p></div>${button(label, org.donationUrl)}</div></section>`;
}
function gallery(home = false) {
  const keys = home ? ['distribution', 'community'] : ['distribution', 'group', 'community'];
  return `<section class="section wrap" id="photos"><div class="section-heading"><h2>Impact in action</h2>${home ? textLink('See Our Impact', '/impact/') : ''}</div><div class="photo-grid ${home ? 'photo-grid-home' : ''}">${keys.map(key => `<figure>${photo(key)}${photos[key].caption ? `<figcaption>${e(photos[key].caption)}</figcaption>` : ''}</figure>`).join('')}</div></section>`;
}
function workCards() {
  return `<div class="program-grid"><article class="program-card">${photo('distribution')}<h3>${e(programs.supplies.title)}</h3><p>${e(programs.supplies.description)}</p>${textLink('Learn more', programs.supplies.path)}</article><article class="program-card">${programIdentity()}<h3>${e(programs.entrepreneurship.title)}</h3><p>${e(programs.entrepreneurship.description)}</p>${textLink('Learn more', ybf.path)}</article></div><div class="work-note"><h3>${e(programs.stem.title)}</h3><p>${e(programs.stem.description)}</p>${textLink('Learn more', programs.stem.path)}</div>`;
}
function home() {
  return `<section class="home-hero">${photo('group', { eager: true, sizes: '100vw', className: 'hero-image' })}<div class="hero-shade"></div><div class="wrap hero-content"><h1>Crayons for Change</h1><p class="hero-mission">Expanding access to education,<br class="desktop-break"> one student at a time.</p><p class="hero-description">A youth-led 501(c)(3) nonprofit working to expand educational access for underserved students.</p><div class="button-row">${button('See Our Impact', '/impact/', 'white')}${button('Donate', org.donationUrl)}</div></div></section>
${metrics({ link: true })}<section class="section wrap image-text">${photo('community')}<div><h2>Education should not depend on what a student can afford.</h2><p>${e(org.mission)}</p>${textLink('About Crayons for Change', '/about/')}</div></section>
<section class="section wrap"><div class="section-heading"><h2>What we do</h2>${textLink('Our Work', '/programs/')}</div>${workCards()}</section>${featuredProgram()}${gallery(true)}${donationBand()}`;
}
function about() {
  // CONTENT NEEDED - DO NOT GENERATE PLACEHOLDER COPY: story and current leadership.
  const story = org.story.length ? `<section class="section wrap prose"><h2>Our Story</h2>${paragraphs(org.story)}</section>` : '';
  const team = published(org.team);
  return `${heading('About Crayons for Change', 'A youth-led nonprofit expanding access to education.')}<section class="section section-tint"><div class="wrap image-text">${photo('community', { eager: true })}<div><h2>Our mission</h2><p>${e(org.mission)}</p><p>${e(totalsSentence())}</p>${textLink('See Our Impact', '/impact/')}</div></div></section>${story}${team.length ? `<section class="section wrap"><h2>Leadership</h2><div class="program-grid">${team.map(person => `<article class="program-card">${person.image ? recordImage(person.image) : ''}<h3>${e(person.name)}</h3><p>${e(person.role)}</p><p>${e(person.bio)}</p></article>`).join('')}</div></section>` : ''}`;
}
function work() {
  return `${heading('Our Work', 'School supplies, youth entrepreneurship, and STEM education.')}<section class="section section-tint"><div class="wrap feature-program"><div><p class="eyebrow">Current program</p><h2>${e(ybf.title)}</h2><p>${e(ybf.summary)}</p><p>${e(schedule())}</p>${button('View the program', ybf.path)}</div>${programIdentity()}</div></section><section class="section wrap image-text" id="supplies"><div><h2>${e(programs.supplies.title)}</h2><p>${e(programs.supplies.description)}</p><p>C4C has distributed ${impact.suppliesDistributed} school supplies through its projects.</p><div class="button-row">${textLink('View our impact', '/impact/')}${textLink('Donate', org.donationUrl)}</div></div>${photo('distribution')}</section><section class="section section-tint" id="stem"><div class="wrap prose"><h2>${e(programs.stem.title)}</h2><p>${e(programs.stem.description)}</p></div></section><section class="section wrap" id="past-programs"><h2>Past programs</h2><article class="archive-row"><div><p class="eyebrow">Past program</p><h3>${e(programs.pastYbf.title)}</h3><p>${e(programs.pastYbf.summary)}</p></div>${textLink('About this past program', programs.pastYbf.path)}</article></section>`;
}
function timeline() {
  return `<ol class="program-timeline"><li><strong>${date(ybf.startDate)}</strong><span>Program begins</span></li><li><strong>${date(ybf.startDate)} &ndash; ${date(ybf.lastClassDate)}</strong><span>Weekly online classes</span></li><li><strong>${date(ybf.fairDate)}</strong><span>Virtual Youth Business Fair</span></li></ol>`;
}
function registration() {
  // Temporary prices stay hidden without JS, so cached HTML cannot advertise expired pricing.
  const price = ybf.pricing;
  return `<section class="section section-tint" id="registration"><div class="wrap registration"><div><h2>Registration</h2><p>Register through Zeffy for classes and the competition.</p>${button('Register Through Zeffy', ybf.registrationUrl)}<p class="fine-print">Registration and payment are handled by Zeffy.</p></div><div><div data-early-bird data-end-date="${price.earlyBirdEndsOn}" data-time-zone="${price.timeZone}" hidden><h3>Early bird registration</h3><dl class="pricing">${price.earlyBird.map(item => `<div><dt>${e(item.label)}<span>${e(item.description)}</span></dt><dd>$${item.price}</dd></div>`).join('')}</dl><p class="fine-print">Early-bird offer ends ${date(price.earlyBirdEndsOn, true)}. Check Zeffy for availability.</p></div><div data-current-pricing><h3>Current registration</h3><p>See the available registration options and current prices on Zeffy.</p>${textLink('View Current Registration', ybf.registrationUrl)}</div></div></div></section>`;
}
function winter() {
  return `${heading(ybf.title, ybf.tagline, 'Current program')}<section class="program-overview section-tint"><div class="wrap"><dl class="program-summary"><div><dt>Format</dt><dd>10 weeks, online</dd></div><div><dt>Weekly classes</dt><dd>${e(ybf.weekday)}s${time() ? `<br>${e(time())}` : ''}</dd></div><div><dt>Class dates</dt><dd>${date(ybf.startDate)} &ndash; ${date(ybf.lastClassDate)}, 2026</dd></div></dl></div></section><section class="section wrap split-copy"><div><h2>About the program</h2><p>Crayons for Change's ${e(ybf.title)} (YBF) is a 10-week online entrepreneurship program.</p><p>Throughout the program, students build their own businesses while learning:</p></div><ul class="topic-list">${ybf.topics.map(topic => `<li>${e(topic)}</li>`).join('')}</ul></section><section class="section wrap"><h2>Program timeline</h2>${timeline()}</section>${registration()}`;
}
function archive() {
  return `${heading(programs.pastYbf.title, programs.pastYbf.format, 'Past program')}<section class="section section-tint"><div class="wrap prose"><h2>About the program</h2><p>${e(programs.pastYbf.summary)}</p><p>This program has concluded.</p>${textLink('See the current Winter Youth Business Fair', ybf.path)}</div></section>`;
}
function recordImage(image) {
  if (!image) return '';
  if (![image.width, image.height].every(value => Number.isInteger(value) && value > 0)) throw new Error('Content photos need their real width and height');
  return `<figure><img src="${h(image.src)}" width="${image.width}" height="${image.height}" alt="${e(image.alt)}" loading="lazy" decoding="async">${image.caption ? `<figcaption>${e(image.caption)}</figcaption>` : ''}</figure>`;
}
function documents(records) {
  return `<ul class="document-list">${records.map(record => `<li>${textLink(record.title, record.url)}</li>`).join('')}</ul>`;
}
function optionalImpact() {
  // CONTENT NEEDED: verified projects and results organized by date/year.
  const entries = published(impact.timeline), projects = published(impact.projects), reports = published(impact.reports), financial = published(impact.financialRecords);
  return `${entries.length ? `<section class="section wrap"><h2>Impact over time</h2><ol class="impact-timeline">${entries.map(entry => `<li><strong>${e(entry.date)}</strong><h3>${e(entry.title)}</h3><p>${e(entry.description)}</p></li>`).join('')}</ol></section>` : ''}${projects.length ? `<section class="section wrap" id="projects"><h2>Impact projects</h2><div class="program-grid">${projects.map(project => `<article class="program-card">${recordImage(project.coverImage)}<p class="eyebrow">${e(project.category)}</p><h3>${e(project.title)}</h3><p>${e(project.location)} &middot; ${date(project.date, true)}</p><p>${e(project.summary)}</p>${textLink('View project', `/impact/projects/${project.slug}/`)}</article>`).join('')}</div></section>` : ''}${impact.locations.length ? `<section class="section wrap"><h2>Where we work</h2><ul>${impact.locations.map(location => `<li>${e(location)}</li>`).join('')}</ul></section>` : ''}${reports.length ? `<section class="section wrap" id="reports"><h2>Impact Reports</h2>${documents(reports)}</section>` : ''}${financial.length ? `<section class="section wrap"><h2>Financial records</h2>${documents(financial)}</section>` : ''}`;
}
function impactPage() {
  return `${heading('Our Impact', 'Every number represents resources or opportunities delivered directly to students.')}<div class="wrap impact-cover">${photo('group', { eager: true, sizes: '100vw' })}</div>${metrics({ title: false })}${optionalImpact()}${gallery()}<section class="section section-tint"><div class="wrap support-inner"><div><h2>Where your support goes</h2><p>${e(org.donationExplanation)}</p></div>${button('Support Our Work', org.donationUrl)}</div></section>`;
}
function opportunitySection(title, records) {
  // CONTENT NEEDED - DO NOT GENERATE PLACEHOLDER COPY: approved opportunities only.
  const live = published(records);
  return live.length ? `<section class="section wrap"><h2>${title}</h2>${live.map(item => `<article class="involvement-row"><div><h3>${e(item.title)}</h3><p>${e(item.description)}</p></div>${item.url ? textLink(item.linkLabel, item.url) : ''}</article>`).join('')}</section>` : '';
}
function involved() {
  return `${heading('Get Involved', 'Support educational access or join a C4C program.')}<section class="wrap involvement"><article class="involvement-row" id="donate"><div><h2>Donate</h2><p>${e(org.donationExplanation)}</p><p class="fine-print">Zeffy offers one-time, monthly, quarterly, and yearly donations and provides tax receipts.</p></div>${button('Donate', org.donationUrl)}</article><article class="involvement-row" id="join"><div><h2>Join a program</h2><h3>${e(ybf.title)}</h3><p>${e(ybf.summary)}</p><p>${e(schedule())}</p></div>${button('View the program', ybf.path, 'outline')}</article></section>${opportunitySection('Volunteer', data.involvement.volunteer)}${opportunitySection('Partner With Us', data.involvement.partnerships)}`;
}
function contact() {
  return `${heading('Contact Us')}<section class="section wrap contact-layout"><div class="contact-details"><h2>Get in touch</h2><dl><div><dt>Email</dt><dd><a href="mailto:${e(org.email)}">${e(org.email)}</a></dd></div><div><dt>Instagram</dt><dd><a href="${h(org.instagram)}">@crayons_for_change ${arrow}</a></dd></div></dl></div><form id="contact-form" action="mailto:${e(org.email)}" method="get"><h2>Write to us</h2><p class="form-note">This form prepares an email draft. You send it from your email app.</p><div class="form-pair"><div><label for="contact-name">Name</label><input id="contact-name" name="name" autocomplete="name" required maxlength="100"></div><div><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254"></div></div><label for="contact-subject">Subject</label><input id="contact-subject" name="subject" required maxlength="160"><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="6" required maxlength="3000"></textarea><button class="button button-primary" type="submit">Prepare email ${arrow}</button><p id="form-status" role="status" class="form-note"></p><a id="draft-link" hidden>Open email draft ${arrow}</a><noscript><p>Email us directly at <a href="mailto:${e(org.email)}">${e(org.email)}</a>.</p></noscript></form></section>`;
}
const pages = [
  ['/', 'Crayons for Change', org.mission, home(), 'home'],
  ['/about/', 'About', org.mission, about()],
  ['/programs/', 'Our Work', 'School supplies, youth entrepreneurship, and STEM education at Crayons for Change.', work()],
  [ybf.path, ybf.title, ybf.summary, winter()],
  [programs.pastYbf.path, programs.pastYbf.title, programs.pastYbf.summary, archive()],
  ['/impact/', 'Our Impact', `${impact.suppliesDistributed} school supplies distributed. ${impact.studentsApproximate ? 'Approximately ' : ''}${impact.studentsSupported} students supported. See Crayons for Change's work in action.`, impactPage()],
  ['/get-involved/', 'Get Involved', 'Support educational access or join the Winter Youth Business Fair.', involved()],
  ['/contact/', 'Contact Us', 'Contact Crayons for Change by email or Instagram.', contact()]
];
for (const p of published(impact.projects)) {
  pages.push([`/impact/projects/${p.slug}/`, p.title, p.summary, `${heading(p.title, `${p.location} | ${date(p.date, true)}`, p.category)}<section class="section wrap">${recordImage(p.coverImage)}<div class="prose"><p>${e(p.summary)}</p>${paragraphs(p.fullDescription || [])}${p.suppliesDistributed != null ? `<p>${p.suppliesDistributed} school supplies distributed.</p>` : ''}${p.studentsSupported != null ? `<p>${p.studentsSupported} students supported.</p>` : ''}${p.partnerName ? `<p>Partner: ${e(p.partnerName)}</p>` : ''}</div><div class="photo-grid">${(p.galleryImages || []).map(recordImage).join('')}</div>${p.documentLinks?.length ? `<h2>Documentation</h2>${documents(p.documentLinks)}` : ''}</section>`]);
}
async function output(file, value) {
  const target = resolve(root, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, value);
}
// Remove old generated project pages when a record is unpublished or removed.
const projectRoot = resolve(root, 'impact/projects');
const liveProjectSlugs = new Set(published(impact.projects).map(project => project.slug));
for (const entry of await readdir(projectRoot, { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT') return []; throw error; })) {
  if (entry.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) && !liveProjectSlugs.has(entry.name)) {
    await rm(resolve(projectRoot, entry.name, 'index.html'), { force: true });
  }
}
for (const [path, title, description, content, className] of pages) {
  await output(`${path.slice(1)}index.html`, shell(path, title, description, content, className));
}
// Keep bookmarked .html routes working without the old transition script.
for (const route of ['about', 'programs', 'impact', 'get-involved', 'contact']) {
  await output(`${route}.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${org.name}</title><link rel="canonical" href="${org.url}/${route}/"><meta http-equiv="refresh" content="0;url=/${route}/"></head><body><a href="/${route}/">Continue to ${route.replace('-', ' ')}</a></body></html>`);
}
await output('404.html', shell('/404.html', 'Page not found', 'Find your way back to Crayons for Change.', `${heading('Page not found', 'The page may have moved.')}<section class="section wrap">${button('Go to the homepage', '/')}</section>`, '', true));
await output('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(([path]) => `<url><loc>${org.url}${path}</loc></url>`).join('')}</urlset>`);
await output('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${org.url}/sitemap.xml\n`);
console.log(`Built ${pages.length} pages from data/content.json, plus legacy redirects and 404.`);

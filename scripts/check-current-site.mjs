import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
for (const page of ['index.html', 'about/index.html', 'programs/index.html', 'programs/project-liso/index.html', 'programs/project-hingyap/index.html', 'programs/project-pitad/index.html']) {
const html = await readFile(new URL(page, root), 'utf8');
for (const [, asset] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|data:|#)/.test(asset)) continue;
  await access(new URL(asset.replace(/^\//, ''), root));
}
for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing section: ${id}`);
}
}
const context = { window: {} };
vm.runInNewContext(await readFile(new URL('website-content.js', root), 'utf8'), context);
for (const photo of Object.values(context.window.C4C_CONTENT.photos)) {
  if (photo.src && !photo.src.startsWith('https:')) await access(new URL(photo.src.replace(/^\//, ''), root));
  if (photo.src && !photo.alt) throw new Error('Photo needs alt text');
}
if ((await readFile(new URL('CNAME', root), 'utf8')).trim() !== 'crayons4change.org') throw new Error('Unexpected domain');
console.log('Static site asset references, section anchors, photos and domain verified.');

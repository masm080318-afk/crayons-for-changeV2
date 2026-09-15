const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
async function main() {
  await fs.mkdir(path.join(root, 'assets'), { recursive: true });
  const sources = [['DSC_2664.JPEG', 'supply-group'], ['DSC_2449.JPEG', 'supply-distribution'], ['67.JPG', 'community']];
  for (const [source, name] of sources) {
    for (const width of [640, 1000, 1600]) {
      await sharp(path.join(root, source)).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(root, `assets/${name}-${width}.webp`));
    }
  }
  await sharp(path.join(root, 'Copy of crayons png.png')).resize({ width: 200 }).png().toFile(path.join(root, 'assets/logo.png'));
  // Preserve the supplied mark; transparent padding replaces the old yellow favicon tile.
  await sharp(path.join(root, 'Copy of crayons png.png')).resize(192, 192, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'favicon.png'));
  await sharp(path.join(root, 'DSC_2664.JPEG')).rotate().resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 85 }).toFile(path.join(root, 'assets/social.jpg'));
  console.log('Optimized the three real C4C photos, logo, favicon, and social image.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

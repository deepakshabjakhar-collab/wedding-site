/**
 * Offline font fetcher — pulls woff2 files from Fontsource packages on the
 * npm registry (Google Fonts is unreachable from this environment) and places
 * them in public/fonts/ using the exact filenames src/styles/fonts.css expects.
 *
 * Usage: node scripts/fetch-fonts-npm.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const CSS_PATH = path.join(ROOT, 'src', 'styles', 'fonts.css');
const OUT_DIR = path.join(ROOT, 'public', 'fonts');

const css = await fs.readFile(CSS_PATH, 'utf8');
const expected = [...css.matchAll(/url\('\/fonts\/([^']+)'\)/g)].map((m) => m[1]);
console.log(`fonts.css expects ${expected.length} files.`);

/** slug -> fontsource package */
const PACKAGES = {
  'allura': '@fontsource/allura',
  'bodoni-moda': '@fontsource/bodoni-moda',
  'cinzel': '@fontsource/cinzel',
  'cinzel-decorative': '@fontsource/cinzel-decorative',
  'cormorant-garamond': '@fontsource/cormorant-garamond',
  'fraunces': '@fontsource-variable/fraunces',
  'gilda-display': '@fontsource/gilda-display',
  'great-vibes': '@fontsource/great-vibes',
  'hanken-grotesk': '@fontsource/hanken-grotesk',
  'italiana': '@fontsource/italiana',
  'italianno': '@fontsource/italianno',
  'josefin-sans': '@fontsource/josefin-sans',
  'jost': '@fontsource/jost',
  'manrope': '@fontsource/manrope',
  'marcellus': '@fontsource/marcellus',
  'mrs-saint-delafield': '@fontsource/mrs-saint-delafield',
  'parisienne': '@fontsource/parisienne',
  'pinyon-script': '@fontsource/pinyon-script',
  'playfair-display': '@fontsource/playfair-display',
  'sacramento': '@fontsource/sacramento',
  'tangerine': '@fontsource/tangerine',
};

await fs.mkdir(OUT_DIR, { recursive: true });
const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'vellum-fonts-'));

const slugOf = (file) => {
  const base = file.replace(/\.woff2$/, '');
  const slugs = Object.keys(PACKAGES).sort((a, b) => b.length - a.length);
  return slugs.find((s) => base.startsWith(`${s}-`));
};

/** expected filename -> candidate source filenames inside package/files */
function candidates(expectedFile) {
  const slug = slugOf(expectedFile);
  if (!slug) return [];
  const rest = expectedFile.slice(slug.length + 1, -'.woff2'.length); // e.g. 400-normal
  if (slug === 'fraunces') {
    const style = rest.endsWith('italic') ? 'italic' : 'normal';
    return [
      `fraunces-latin-wght-${style}.woff2`,
      `fraunces-latin-full-wght-${style}.woff2`,
      `fraunces-latin-standard-wght-${style}.woff2`,
    ];
  }
  const m = /^(\d+)-(normal|italic)$/.exec(rest);
  if (!m) return [];
  const [, weight, style] = m;
  return [
    `${slug}-latin-${weight}-${style}.woff2`,
    `${slug}-latin-full-${weight}-${style}.woff2`,
    `${slug}-latin-standard-${weight}-${style}.woff2`,
  ];
}

const needed = new Map(); // pkg -> Set(slugs)
for (const file of expected) {
  const slug = slugOf(file);
  if (!slug) {
    console.warn(`  ? no package mapping for ${file}`);
    continue;
  }
  const pkg = PACKAGES[slug];
  if (!needed.has(pkg)) needed.set(pkg, new Set());
  needed.get(pkg).add(slug);
}

const missing = [];
for (const [pkg] of needed) {
  console.log(`▸ ${pkg}`);
  let tarball;
  try {
    const out = execFileSync('npm', ['pack', pkg, '--pack-destination', tmp, '--silent'], {
      encoding: 'utf8',
    }).trim().split('\n').pop();
    tarball = path.join(tmp, out);
  } catch (error) {
    console.error(`  ✗ pack failed: ${error.message}`);
    continue;
  }
  const dest = path.join(tmp, pkg.replace('/', '-'));
  await fs.mkdir(dest, { recursive: true });
  try {
    execFileSync('tar', ['-xzf', tarball, '-C', dest]);
  } catch (error) {
    console.error(`  ✗ extract failed: ${error.message}`);
    continue;
  }
  const filesDir = path.join(dest, 'package', 'files');
  let available = [];
  try {
    available = await fs.readdir(filesDir);
  } catch {
    console.error(`  ✗ no files/ dir in ${pkg}`);
    continue;
  }
  const woff2 = available.filter((f) => f.endsWith('.woff2'));
  for (const file of expected.filter((f) => PACKAGES[slugOf(f)] === pkg)) {
    const target = path.join(OUT_DIR, file);
    try {
      const stat = await fs.stat(target);
      if (stat.size > 0) continue; // already have it
    } catch { /* fetch it */ }
    const hit = candidates(file).find((c) => available.includes(c));
    if (!hit) {
      // last resort: any latin woff2 of the same style for this slug
      const style = file.endsWith('italic.woff2') ? 'italic' : 'normal';
      const slug = slugOf(file);
      const fallback = woff2.find((f) => f.startsWith(`${slug}-latin-`) && f.endsWith(`-${style}.woff2`));
      if (fallback) {
        await fs.copyFile(path.join(filesDir, fallback), target);
        console.log(`  ~ ${file} (from ${fallback})`);
      } else {
        console.error(`  ✗ ${file}: no match (have: ${woff2.slice(0, 4).join(', ')}…)`);
        missing.push(file);
      }
      continue;
    }
    await fs.copyFile(path.join(filesDir, hit), target);
    console.log(`  ✓ ${file}`);
  }
}

await fs.rm(tmp, { recursive: true, force: true });

const present = await fs.readdir(OUT_DIR);
console.log(`\npublic/fonts now holds ${present.length} files; ${missing.length} missing.`);
if (missing.length) {
  console.log('Missing:', missing.join(', '));
  process.exitCode = 1;
}

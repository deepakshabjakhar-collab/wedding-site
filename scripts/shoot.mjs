/**
 * Takes showcase screenshots of the site with Playwright (runs in CI,
 * where a real Chromium is available). Usage: SHOOT_BASE=http://127.0.0.1:4173 node scripts/shoot.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = process.env.SHOOT_BASE ?? 'http://127.0.0.1:4173';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844 };
const DESK = { width: 1440, height: 900 };

const browser = await chromium.launch();

async function newPage(viewport) {
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 2,
  });
  return page;
}

/** Settle a page: load, wait for webfonts, let entrance motion finish. */
async function settle(page, url, dwellMs = 1400) {
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {});
  await page.waitForTimeout(dwellMs);
}

/** Remove the fixed "Live design preview" bar so invitation shots are clean. */
async function cleanPreview(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.fixed').forEach((el) => {
      if (el.className.includes('z-[70]')) el.remove();
    });
  }).catch(() => {});
}

async function shot(page, name, fullPage = false) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage });
  console.log('✓', name);
}

// ---- Marketing pages (desktop) ----
{
  const page = await newPage(DESK);
  await settle(page, `${BASE}/`, 2200);
  await shot(page, 'landing-top.png');
  await page.close();
}
{
  const page = await newPage(DESK);
  await settle(page, `${BASE}/templates`, 1800);
  // Scroll through so reveal-on-scroll cards all mount before the stitched shot.
  for (let y = 0; y <= 4200; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(220);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await shot(page, 'templates-grid.png', true);
  await page.close();
}

// ---- Every gate, closed (phone) ----
const IDS = ['aurelia', 'maison', 'belgrave', 'celeste', 'salento', 'noir', 'heirloom', 'miel'];
for (const id of IDS) {
  const page = await newPage(PHONE);
  await settle(page, `${BASE}/templates/${id}`, 1600);
  await cleanPreview(page);
  await shot(page, `gate-${id}.png`);
  await page.close();
}

// ---- Full opening sequences: tap the seal, mid-ceremony, opened ----
for (const id of ['celeste', 'aurelia', 'belgrave', 'maison']) {
  const page = await newPage(PHONE);
  await settle(page, `${BASE}/templates/${id}`, 1200);
  await cleanPreview(page);
  const seal = page.locator('.inv-gate button[aria-label]');
  await seal.click({ timeout: 10000 });
  await page.waitForTimeout(5200);
  await shot(page, `${id}-mid.png`);
  await page.waitForTimeout(7600); // ~12.8s total: ceremony complete
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await shot(page, `${id}-open.png`);
  await page.evaluate(() => window.scrollBy(0, 2200));
  await page.waitForTimeout(900);
  await shot(page, `${id}-below.png`);
  await page.close();
}

await browser.close();
console.log(`\nDone — ${fs.readdirSync(OUT).length} screenshots in ${OUT}`);

// Renders every Gatori-ai image from card.html and compare.html.
//   node brand/render.mjs   (uses playwright-core from ../embed-anywhere and the installed Chrome)
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const prod = resolve(here, '..', '..');
const { chromium } = createRequire(join(prod, 'embed-anywhere', 'package.json'))('playwright-core');

const repos = [
  { repo: 'ai-copy-trainer', t: 'AI Copy Trainer', s: 'Teach AI to write like you.' },
  { repo: 'funnel-ecosystem-map', t: 'Funnel & Ecosystem Map', s: 'Describe your business. Get a map you can edit.' },
  { repo: 'embed-anywhere', t: 'Embed Anywhere', s: 'Your agent puts your page on any site builder, and checks it.' },
];
const org = { t: 'Gatori', s: 'Free tools for building your own work with AI.', by: 'Free and open source &nbsp;&middot;&nbsp; <b>gatori.ai</b>' };
const out = (...p) => { const f = join(...p); mkdirSync(dirname(f), { recursive: true }); return f; };
const card = (q, night) => pathToFileURL(join(here, 'card.html')).href + '?' + new URLSearchParams(q) + (night ? '#night' : '');

const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function shot(url, w, h, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file });
  await page.close();
  console.log(file);
}
const jobs = [];
for (const r of repos) {
  jobs.push([card({ kind: 'social', t: r.t, s: r.s, repo: r.repo }), 1280, 640, out(here, 'out', r.repo, 'social-preview.png')]);
  if (r.repo === 'embed-anywhere') for (const night of [false, true]) {
    jobs.push([card({ kind: 'banner', t: r.t, s: 'Your page, on any site builder.' }, night), 1600, 520, out(prod, 'embed-anywhere', 'assets', night ? 'banner-night.png' : 'banner.png')]);
  }
}
jobs.push([card({ kind: 'social', t: org.t, s: org.s, by: 'github.com/Gatori-ai &nbsp;&middot;&nbsp; Free and open source &nbsp;&middot;&nbsp; <b>gatori.ai</b>' }), 1280, 640, out(here, 'out', '.github', 'social-preview.png')]);
for (const night of [false, true]) jobs.push([card({ kind: 'banner', ...org }, night), 1600, 520, out(prod, 'gatori-ai-github', 'profile', night ? 'banner-night.png' : 'banner.png')]);
const ea = join(prod, 'embed-anywhere', 'embed-check');
for (const night of [false, true]) {
  const q = new URLSearchParams({ a: pathToFileURL(join(ea, 'plain-iframe', 'width-1440.png')).href, b: pathToFileURL(join(ea, 'section', 'width-1440.png')).href });
  jobs.push([pathToFileURL(join(here, 'compare.html')).href + '?' + q + (night ? '#night' : ''), 1600, 940, out(prod, 'embed-anywhere', 'assets', night ? 'before-after-night.png' : 'before-after.png')]);
}
for (const j of jobs) await shot(...j);
await browser.close();

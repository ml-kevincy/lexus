// Mirror selected lexus.com.tw pages into OUT for usability testing.
// usage: node capture.mjs <outDir>
import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(process.argv[2]);
const ORIGIN = 'https://www.lexus.com.tw';
const PAGES = [
  { url: ORIGIN + '/', file: 'index.html' },
  { url: ORIGIN + '/showroom/NX', file: 'showroom/NX.html' },
  { url: ORIGIN + '/showroom/ES', file: 'showroom/ES.html' },
  { url: ORIGIN + '/testdrive.aspx', file: 'testdrive.html' },
];
const MIRROR_HOSTS = { 'www.lexus.com.tw': '', 'lexuscdn.lexus.com.tw': '_cdn/' };
const TRACKERS = /googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook|appier|vm5apis|hinet\.net|line-scdn|tr\.line\.me|hotjar|doubleclick|googleadservices|_lt\(|clarity\.ms/i;
const ASSET_EXT = /\.(jpe?g|png|gif|webp|avif|svg|mp4|webm|css|js|woff2?|ttf|otf|eot|ico|json|xml)$/i;
// Endpoints whose responses are replayed from disk via the XHR shim.
const API_RE = /^\/(api|xml)\/[^?]+\.ashx/i;

const assets = new Map(); // absolute url -> Buffer|null
const apis = new Map();   // key -> body

const pageMap = new Map(PAGES.map(p => [new URL(p.url).pathname.toLowerCase().replace(/\/$/, '') || '/', p.file]));

function localPath(u) {
  const url = new URL(u);
  const prefix = MIRROR_HOSTS[url.host];
  if (prefix === undefined) return null;
  let p; try { p = decodeURIComponent(url.pathname); } catch { p = url.pathname; } p = p.replace(/^\//, '');
  if (!p || p.endsWith('/')) p += 'index.html';
  return prefix + p;
}
function apiKey(u) {
  const url = new URL(u);
  const params = [...url.searchParams].filter(([k, v]) => !k.startsWith('_') && !/^\d{6,}$/.test(v)).sort();
  const qs = params.map(([k, v]) => `${k}=${v}`).join('&');
  return url.pathname.replace(/^\//, '') + (qs ? '__' + qs.replace(/[^\w=&.-]/g, '_') : '') + '.txt';
}

const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const docs = new Map();
for (const vp of [
  { width: 1440, height: 900 },
  { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
]) {
  for (const pg of PAGES) {
    const page = await browser.newPage();
    if (vp.ua) await page.setUserAgent(vp.ua);
    await page.setViewport(vp);
    page.on('response', async r => {
      const u = r.url();
      let host; try { host = new URL(u).host; } catch { return; }
      if (!(host in MIRROR_HOSTS) || r.request().method() !== 'GET') return;
      const pathname = new URL(u).pathname;
      if (API_RE.test(pathname)) { try { apis.set(apiKey(u), await r.text()); } catch {} return; }
      if (r.status() !== 200) { if (!assets.has(u)) assets.set(u, null); return; }
      try { assets.set(u, await r.buffer()); } catch { if (!assets.has(u)) assets.set(u, null); }
    });
    const resp = await page.goto(pg.url, { waitUntil: 'networkidle2', timeout: 120000 });
    if (!docs.has(pg.file)) docs.set(pg.file, await resp.text());
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); }
    });
    await new Promise(r => setTimeout(r, 2500));
    await page.close();
  }
}
await browser.close();

// Collect references that were never requested (lazy images, other breakpoints, css urls).
const refRe = /(?:https?:)?\/\/(?:www|lexuscdn)\.lexus\.com\.tw\/[^"'\s)<>]+|(?<=["'(=,\s])\/[A-Za-z0-9_\-./%一-鿿]+\.(?:jpe?g|png|gif|webp|svg|mp4|webm|css|js|woff2?|ttf|otf|eot|ico)(?:\?[^"'\s)<>]*)?/g;
function refsIn(text, base) {
  const out = new Set();
  for (const m of text.matchAll(refRe)) {
    try { const u = new URL(m[0].startsWith('//') ? 'https:' + m[0] : m[0], base); if (u.host in MIRROR_HOSTS && ASSET_EXT.test(u.pathname)) { u.hash = ''; out.add(u.href); } } catch {}
  }
  return out;
}
async function fetchAsset(u) {
  try { const r = await fetch(u); if (!r.ok) return null; return Buffer.from(await r.arrayBuffer()); } catch { return null; }
}
for (const [file, html] of docs) for (const u of refsIn(html, PAGES.find(p => p.file === file).url)) if (!assets.has(u)) assets.set(u, null);
for (let round = 0; round < 3; round++) {
  const pending = [...assets].filter(([u, b]) => b === null && !assets.get(u + '#tried')).map(([u]) => u);
  for (const u of pending) { assets.set(u + '#tried', true); const b = await fetchAsset(u); if (b) assets.set(u, b); }
  for (const [u, b] of [...assets]) {
    if (!b || !(/\.(css|js)$/i.test(new URL(u).pathname))) continue;
    for (const ref of refsIn(b.toString('utf8'), u)) if (!assets.has(ref)) assets.set(ref, null);
  }
}

// Rewrite helpers.
const rel = (fromFile, toFile) => { const r = path.posix.relative(path.posix.dirname(fromFile), toFile); return r || './'; };
function rewriteUrl(raw, base, fromFile, { html } = {}) {
  let u; try { u = new URL(raw.startsWith('//') ? 'https:' + raw : raw, base); } catch { return raw; }
  if (!(u.host in MIRROR_HOSTS)) return raw;
  const key = u.pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (html && u.host === 'www.lexus.com.tw' && pageMap.has(key)) return rel(fromFile, pageMap.get(key)) + u.hash;
  if (u.host === 'www.lexus.com.tw' && API_RE.test(u.pathname) && apis.has(apiKey(u.href))) return encodeURI(rel(fromFile, '_api/' + apiKey(u.href)));
  const lp = localPath(u.href);
  const noHash = new URL(u.href); noHash.hash = '';
  if (assets.get(noHash.href)) return encodeURI(rel(fromFile, lp));
  // Not mirrored: send to the live site.
  return u.href;
}
const textRe = /((?:https?:)?\/\/(?:www|lexuscdn)\.lexus\.com\.tw\/[^"'\s)<>\\]*)/g;
function rewriteText(text, base, fromFile, opts) {
  text = text.replace(textRe, m => rewriteUrl(m, base, fromFile, opts));
  // url(/x) and url(relative) in CSS
  text = text.replace(/url\(\s*(['"]?)(?!data:|https?:|\/\/|#)([^'")]+)\1\s*\)/g, (m, q, p) => `url(${q}${rewriteUrl(p, base, fromFile, opts)}${q})`);
  return text;
}

const written = { assets: 0, bytes: 0, missing: [] };
for (const [u, b] of assets) {
  if (u.endsWith('#tried')) continue;
  if (!b) { written.missing.push(u); continue; }
  const lp = localPath(u); if (!lp) continue;
  if (pageMap.has(new URL(u).pathname.toLowerCase().replace(/\/$/, '') || '/')) continue;
  let data = b;
  if (/\.css$/i.test(lp)) data = Buffer.from(rewriteText(b.toString('utf8'), u, lp));
  // Hard-coded navigations to mirrored pages, e.g. location.href = "/testdrive.aspx?id=" + id
  if (/\.js$/i.test(lp)) {
    let t = b.toString('utf8'), before = t;
    for (const [p, file] of pageMap) {
      if (p === '/') continue;
      const esc = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      t = t.replace(new RegExp(`(["'])${esc}(?=[?#"'])`, 'gi'), (m, q) => `(window.__MIRROR_ROOT||"")+${q}${file}`);
    }
    // Root-relative asset literals ("/images/x.png") handed to APIs the shim cannot see (e.g. Google Maps icons)
    t = t.replace(/(["'])\/((?:images|upload)\/[^"'\s]+\.(?:png|jpe?g|gif|svg|webp))\1/gi, (m, q, p) => `(window.__MIRROR_ROOT||"")+${q}${p}${q}`);
    if (t !== before) data = Buffer.from(t);
  }
  const dest = path.join(OUT, lp);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, data);
  written.assets++; written.bytes += data.length;
}
for (const [key, body] of apis) {
  const dest = path.join(OUT, '_api', key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, body);
}

const shim = (fromFile) => {
  const root = rel(fromFile, 'x').replace(/x$/, '');
  const pages = Object.fromEntries(pageMap);
  // Allowlist scripts so tracking/conversion tags (incl. ones injected later) never fire.
  const csp = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://use.fontawesome.com https://www.youtube.com https://s.ytimg.com https://maps.googleapis.com https://maps.gstatic.com https://*.maze.co";
  return `<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="robots" content="noindex,nofollow">
<script>window.__MIRROR_ROOT=${JSON.stringify(root)};window.__MIRROR_PAGES=${JSON.stringify(pages)};</script>
<script src="${root}_mirror/shim.js"></script>`;
};
await fs.mkdir(path.join(OUT, '_mirror'), { recursive: true });
await fs.copyFile(new URL('./shim.js', import.meta.url), path.join(OUT, '_mirror/shim.js'));

for (const pg of PAGES) {
  let html = docs.get(pg.file);
  // strip trackers
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, s => TRACKERS.test(s) ? '' : s);
  html = html.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, s => TRACKERS.test(s) ? '' : s);
  html = html.replace(/<img\b[^>]*(facebook\.com\/tr|doubleclick)[^>]*>/gi, '');
  // root-relative and absolute urls in attributes
  html = html.replace(/(\s(?:src|href|data-[\w-]+|poster|srcset|content|action)\s*=\s*)(["'])([^"']*)\2/gi, (m, a, q, v) => {
    if (/^(#|javascript:|mailto:|tel:|data:)/i.test(v) || !v) return m;
    if (/data-target\s*=/i.test(a)) return m; // 選單用的是 id 名稱（如 models），不是網址
    if (/srcset/i.test(a)) return a + q + v.split(',').map(s => s.trim().replace(/^\S+/, x => rewriteUrl(x, pg.url, pg.file, { html: true }))).join(', ') + q;
    return a + q + rewriteUrl(v, pg.url, pg.file, { html: true }) + q;
  });
  html = rewriteText(html, pg.url, pg.file, { html: true });
  // local copies are rewritten, so SRI hashes no longer match
  html = html.replace(/<(link|script)\b[^>]*>/gi, t => /(src|href)="(?!https?:|\/\/)/i.test(t) ? t.replace(/\s(integrity|crossorigin)(=("[^"]*"|'[^']*'|\S+))?/gi, '') : t);
  html = html.replace(/<head([^>]*)>/i, (m, a) => `<head${a}>\n${shim(pg.file)}`);
  const dest = path.join(OUT, pg.file);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, html);
}

console.log(JSON.stringify({ pages: PAGES.length, assets: written.assets, MB: +(written.bytes / 1e6).toFixed(1), apis: [...apis.keys()], missing: written.missing.length }, null, 1));
await fs.writeFile(path.join(OUT, '_missing.txt'), written.missing.join('\n'));

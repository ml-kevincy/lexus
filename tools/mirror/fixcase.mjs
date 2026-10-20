// macOS folds case, GitHub Pages does not: the site uses both "CAR_BNR/" and "car_bnr/",
// which land in one folder on disk. Rewrite local references to the exact on-disk case.
// usage: node fixcase.mjs <mirrorDir>
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2]);

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}

const files = (await walk(ROOT)).map(f => path.relative(ROOT, f).split(path.sep).join('/'));
const byLower = new Map(files.map(f => [f.toLowerCase(), f]));

// Relative references like "../_cdn/lexusweb/upload/CAR_BNR/x.jpg" or "images/a.png".
const REF = /(?<![\w/.])((?:\.\.\/)*[\w\-.%一-鿿]+(?:\/[\w\-.%一-鿿&=]+)+\.[a-z0-9]{2,5})(?=["'\s)?#,])/gi;
let changed = 0;
for (const f of files) {
  if (!/\.(html|css|js)$/i.test(f)) continue;
  const full = path.join(ROOT, f);
  const text = await fs.readFile(full, 'utf8');
  const dir = path.posix.dirname(f);
  let n = 0;
  const fixed = text.replace(REF, ref => {
    let target;
    try { target = path.posix.normalize(path.posix.join(dir, decodeURI(ref))); } catch { return ref; }
    if (target.startsWith('..')) return ref;
    const actual = byLower.get(target.toLowerCase());
    if (!actual || actual === target) return ref;
    n++;
    const r = path.posix.relative(dir, actual);
    return ref.includes('%') ? encodeURI(r) : r;
  });
  if (n) { await fs.writeFile(full, fixed); changed += n; console.log(f, n); }
}
console.log('references fixed:', changed);

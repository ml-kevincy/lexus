import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = process.argv[2], PORT = +process.argv[3];
const T = { '.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.mp4':'video/mp4','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(ROOT, p); if (f.endsWith('/')) f += 'index.html';
  fs.stat(f, (e, s) => {
    if (e || !s.isFile()) { console.log('404', p); res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': T[path.extname(f).toLowerCase()] || 'application/octet-stream', 'content-length': s.size });
    fs.createReadStream(f).pipe(res);
  });
}).listen(PORT, () => console.log('serving', ROOT, PORT));

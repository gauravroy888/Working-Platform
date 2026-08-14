const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // Normalize path
  if (pathname === '/') {
    pathname = '/index.html';
  }

  let filePath = path.join(ROOT, pathname);

  // Check if requested path is a directory or file exists
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      const indexHtml = path.join(filePath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        filePath = indexHtml;
      }
    }

    // Check SPA rewrites if file doesn't exist
    if (err || !fs.existsSync(filePath)) {
      if (pathname.startsWith('/student') && !path.extname(pathname)) {
        filePath = path.join(ROOT, 'student', 'index.html');
      } else if (pathname.startsWith('/teacher') && !path.extname(pathname)) {
        filePath = path.join(ROOT, 'teacher', 'index.html');
      } else if (pathname.startsWith('/admin') && !path.extname(pathname)) {
        filePath = path.join(ROOT, 'admin', 'index.html');
      } else if (pathname.startsWith('/superadmin') && !path.extname(pathname)) {
        filePath = path.join(ROOT, 'superadmin', 'index.html');
      } else if (pathname.startsWith('/study-island') && !path.extname(pathname)) {
        filePath = path.join(ROOT, 'study-island', 'index.html');
      } else if (!path.extname(pathname)) {
        filePath = path.join(ROOT, 'index.html');
      }
    }

    // Read and stream file
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found: ' + pathname);
        return;
      }

      res.writeHead(200, { 'Content-Type': getContentType(filePath) });
      res.end(content);
    });
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Cognitive Island Local Server running at http://localhost:${PORT}`);
  console.log(`👉 Landing Page:      http://localhost:${PORT}/index.html`);
  console.log(`👉 Login:             http://localhost:${PORT}/login.html`);
  console.log(`👉 SuperAdmin Portal: http://localhost:${PORT}/superadmin/`);
  console.log(`👉 Admin Portal:      http://localhost:${PORT}/admin/`);
  console.log(`👉 Teacher Portal:    http://localhost:${PORT}/teacher/`);
  console.log(`👉 Student Portal:    http://localhost:${PORT}/student/`);
  console.log(`👉 Study Island:      http://localhost:${PORT}/study-island/`);
});

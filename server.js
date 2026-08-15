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

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const R2_CONFIG = {
  bucketName: 'edtechplatform',
  publicCdnUrl: 'https://pub-670b98370fe642a2be08ee37cbfd385f.r2.dev',
  endpoint: 'https://21b75f7da0ec0dde4d08d3f19d2102f3.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '5fd10d137b4e437c604356c7d14b138c',
    secretAccessKey: '229ede3cbc0f2264b9f72545eecf99c12a5e9e06699ba9da08d7544458755693'
  }
};

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: R2_CONFIG.credentials
});

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);

  // ☁️ CLOUDFLARE R2 DIRECT UPLOAD API ENDPOINT
  if (pathname === '/api/upload-r2' && req.method === 'POST') {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const rawBody = Buffer.concat(chunks).toString();
      const body = JSON.parse(rawBody);

      const { className, subjectName, chapterSlug, modalitySlug, filename, base64Content, contentType, category, isAvatar, userEmail } = body;

      if (!filename || !base64Content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'filename and base64Content are required' }));
        return;
      }

      let key;
      if (category === 'avatars' || isAvatar) {
        const cleanEmail = (userEmail || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        const cleanFile = (filename || 'avatar.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        key = `avatars/${cleanEmail}_${Date.now()}_${cleanFile}`;
      } else {
        const cleanClass = (className || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSubj = (subjectName || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanChap = (chapterSlug || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanMod = (modalitySlug || 'content').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanFile = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        key = `courses/${cleanClass}/${cleanSubj}/${cleanChap}/${cleanMod}/${cleanFile}`;
      }

      const fileBuffer = Buffer.from(base64Content, 'base64');
      const mime = contentType || getContentType(filename);

      await s3Client.send(new PutObjectCommand({
        Bucket: R2_CONFIG.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mime
      }));

      const cdnUrl = `${R2_CONFIG.publicCdnUrl}/${key}`;
      console.log(`☁️ [R2 Upload] Saved ${key} (${fileBuffer.length} bytes) -> ${cdnUrl}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        key,
        cdnUrl,
        sizeBytes: fileBuffer.length,
        contentType: mime
      }));
    } catch (err) {
      console.error('❌ R2 Upload Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

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

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const app = require('../src/app');

let server;
let baseUrl;

before(() => {
  server = http.createServer(app);
  server.listen(0);
  const { port } = server.address();
  baseUrl = `http://localhost:${port}`;
});

after(() => {
  server.close();
});

function request(method, url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let json;
        try { json = JSON.parse(Buffer.concat(chunks).toString()); } catch { json = null; }
        resolve({ statusCode: res.statusCode, body: json });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function uploadFile(url, filePath, fieldName = 'file') {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const filename = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);
    const prefix = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    );
    const suffix = Buffer.from(`\r\n--${boundary}--\r\n`);
    const bodyBuf = Buffer.concat([prefix, fileContent, suffix]);

    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuf.length,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let json;
        try { json = JSON.parse(Buffer.concat(chunks).toString()); } catch { json = null; }
        resolve({ statusCode: res.statusCode, body: json });
      });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('GET /health retorna status ok', async () => {
  const res = await request('GET', `${baseUrl}/health`);
  assert.strictEqual(res.statusCode, 200);
  assert.deepStrictEqual(res.body, { status: 'ok' });
});

test('GET /documents retorna lista vazia inicialmente', async () => {
  const res = await request('GET', `${baseUrl}/documents`);
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
});

test('POST /upload sem arquivo retorna 400', async () => {
  const boundary = '----TestBoundary';
  const bodyBuf = Buffer.from(`--${boundary}--\r\n`);
  const res = await new Promise((resolve, reject) => {
    const req = http.request(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuf.length,
      },
    }, (r) => {
      const chunks = [];
      r.on('data', (c) => chunks.push(c));
      r.on('end', () => {
        resolve({ statusCode: r.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) });
      });
    });
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
  assert.strictEqual(res.statusCode, 400);
  assert.ok(res.body.error);
});

test('POST /upload com arquivo lista o documento em GET /documents', async () => {
  const tmpFile = path.join(os.tmpdir(), `dms-test-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, 'conteúdo de teste');

  const uploadRes = await uploadFile(`${baseUrl}/upload`, tmpFile);
  assert.strictEqual(uploadRes.statusCode, 201);
  assert.ok(uploadRes.body.id);
  assert.ok(uploadRes.body.originalName);

  const listRes = await request('GET', `${baseUrl}/documents`);
  assert.strictEqual(listRes.statusCode, 200);
  const found = listRes.body.find((d) => d.id === uploadRes.body.id);
  assert.ok(found, 'documento deve aparecer na listagem');

  fs.unlinkSync(tmpFile);
});

test('GET /documents/:id/download retorna 404 para id inexistente', async () => {
  const res = await request('GET', `${baseUrl}/documents/id-inexistente/download`);
  assert.strictEqual(res.statusCode, 404);
  assert.ok(res.body.error);
});

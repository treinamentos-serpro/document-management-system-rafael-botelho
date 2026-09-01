const { after, before, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

let server;
let baseUrl;
let storageFileNames;
const storageDirectory = path.resolve(__dirname, '../storage');

before(() => {
  storageFileNames = new Set(fs.readdirSync(storageDirectory));
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();

  for (const fileName of fs.readdirSync(storageDirectory)) {
    if (!storageFileNames.has(fileName)) {
      fs.unlinkSync(path.join(storageDirectory, fileName));
    }
  }
});

test('envia, lista e baixa documentos do proprietário', async () => {
  const formData = new FormData();
  formData.append(
    'file',
    new Blob(['conteúdo do documento'], { type: 'application/pdf' }),
    'documento.pdf',
  );

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-a' },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'documento.pdf');
  assert.strictEqual(document.owner, 'usuario-a');

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'usuario-a' },
  });

  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const forbiddenDownloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download`,
    { headers: { 'X-User-Id': 'usuario-b' } },
  );
  assert.strictEqual(forbiddenDownloadResponse.status, 404);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'usuario-a' },
  });

  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(downloadResponse.headers.get('content-type'), 'application/pdf');
  assert.strictEqual(await downloadResponse.text(), 'conteúdo do documento');
});

test('exclui o documento e impede o acesso de outro proprietário', async () => {
  const formData = new FormData();
  formData.append(
    'file',
    new Blob(['conteúdo para excluir'], { type: 'application/pdf' }),
    'excluir.pdf',
  );

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-exclusao' },
    body: formData,
  });
  const document = await uploadResponse.json();
  const storageFileCount = fs.readdirSync(storageDirectory).length;

  const forbiddenDeleteResponse = await fetch(`${baseUrl}/documents/${document.id}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': 'outro-usuario' },
  });
  assert.strictEqual(forbiddenDeleteResponse.status, 404);

  const deleteResponse = await fetch(`${baseUrl}/documents/${document.id}`, {
    method: 'DELETE',
    headers: { 'X-User-Id': 'usuario-exclusao' },
  });
  assert.strictEqual(deleteResponse.status, 204);
  assert.strictEqual(fs.readdirSync(storageDirectory).length, storageFileCount - 1);

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'usuario-exclusao' },
  });
  assert.deepStrictEqual(await listResponse.json(), []);
});
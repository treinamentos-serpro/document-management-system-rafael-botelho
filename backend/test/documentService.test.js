'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Testa o serviço de documentos com mocks.
test('documentService - uploadDocument lança erro sem arquivo', () => {
  delete require.cache[require.resolve('../src/services/documentService')];
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const service = require('../src/services/documentService');

  assert.throws(() => service.uploadDocument(null, 'user'), /Nenhum arquivo enviado/);
});

test('documentService - uploadDocument retorna metadados com arquivo válido', () => {
  delete require.cache[require.resolve('../src/services/documentService')];
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const service = require('../src/services/documentService');

  // Cria um arquivo temporário real para simular o upload
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, 'test-upload.txt');
  fs.writeFileSync(tmpFile, 'conteúdo de teste');

  const fakeFile = {
    originalname: 'relatorio.pdf',
    filename: 'timestamp-relatorio.pdf',
    size: 1024,
    path: tmpFile,
  };

  const doc = service.uploadDocument(fakeFile, 'usuario1');
  assert.ok(doc.id);
  assert.strictEqual(doc.originalName, 'relatorio.pdf');
  assert.strictEqual(doc.owner, 'usuario1');
  assert.ok(doc.uploadedAt);

  fs.unlinkSync(tmpFile);
});

test('documentService - listDocuments retorna array', () => {
  delete require.cache[require.resolve('../src/services/documentService')];
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const service = require('../src/services/documentService');

  const result = service.listDocuments();
  assert.ok(Array.isArray(result));
});

test('documentService - getDocumentFile retorna null para id inexistente', () => {
  delete require.cache[require.resolve('../src/services/documentService')];
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const service = require('../src/services/documentService');

  const result = service.getDocumentFile('id-inexistente');
  assert.strictEqual(result, null);
});

test('documentService - getDocumentFile retorna caminho para documento existente', () => {
  delete require.cache[require.resolve('../src/services/documentService')];
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const service = require('../src/services/documentService');

  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, 'doc-existente.txt');
  fs.writeFileSync(tmpFile, 'dados');

  const fakeFile = {
    originalname: 'planilha.xlsx',
    filename: 'stored-planilha.xlsx',
    size: 512,
    path: tmpFile,
  };

  const saved = service.uploadDocument(fakeFile, 'u2');
  const result = service.getDocumentFile(saved.id);
  assert.ok(result);
  assert.strictEqual(result.originalName, 'planilha.xlsx');
  assert.strictEqual(result.filePath, tmpFile);

  fs.unlinkSync(tmpFile);
});

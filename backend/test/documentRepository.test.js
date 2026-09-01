'use strict';

const { test, mock } = require('node:test');
const assert = require('node:assert');

// Testa o repositório de documentos isoladamente.
test('documentRepository - save e findAll', () => {
  // Usa um módulo isolado a cada require com cache limpo
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const repo = require('../src/repositories/documentRepository');

  const doc = { id: '1', originalName: 'test.pdf', owner: 'user1' };
  repo.save(doc);
  const all = repo.findAll();
  assert.ok(all.length >= 1);
  assert.ok(all.some((d) => d.id === '1'));
});

test('documentRepository - findById encontra documento existente', () => {
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const repo = require('../src/repositories/documentRepository');

  const doc = { id: 'abc', originalName: 'file.txt', owner: 'u' };
  repo.save(doc);
  const found = repo.findById('abc');
  assert.ok(found);
  assert.strictEqual(found.id, 'abc');
});

test('documentRepository - findById retorna null quando não encontrado', () => {
  delete require.cache[require.resolve('../src/repositories/documentRepository')];
  const repo = require('../src/repositories/documentRepository');

  const result = repo.findById('inexistente');
  assert.strictEqual(result, null);
});

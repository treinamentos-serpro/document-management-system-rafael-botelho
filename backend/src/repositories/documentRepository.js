'use strict';

// Repositório de documentos: mantém metadados em memória.
// Responsabilidade única: persistência e recuperação de registros.

const documents = [];

function save(doc) {
  documents.push(doc);
  return doc;
}

function findAll() {
  return [...documents];
}

function findById(id) {
  return documents.find((d) => d.id === id) || null;
}

module.exports = { save, findAll, findById };

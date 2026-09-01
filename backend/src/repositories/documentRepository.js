// Repositório responsável pelo armazenamento dos metadados de documentos em
// memória e pela leitura de arquivos do filesystem local.

const fs = require('fs');
const path = require('path');

const documents = [];

function save(metadata) {
  documents.push(metadata);
  return metadata;
}

function findAll() {
  return [...documents];
}

function findById(id) {
  return documents.find((doc) => doc.id === id) || null;
}

function getFilePath(filename) {
  return path.join(__dirname, '..', '..', 'storage', filename);
}

module.exports = { save, findAll, findById, getFilePath };


'use strict';

// Serviço de documentos: concentra as regras de negócio.
// Responsabilidade única: orquestrar operações sobre documentos.

const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');
const repository = require('../repositories/documentRepository');

function buildMetadata(file, owner) {
  return {
    id: randomUUID(),
    originalName: path.basename(file.originalname),
    storedName: file.filename,
    size: file.size,
    owner: owner || 'anonymous',
    uploadedAt: new Date().toISOString(),
    storedPath: file.path,
  };
}

function uploadDocument(file, owner) {
  if (!file) {
    throw new Error('Nenhum arquivo enviado.');
  }
  const metadata = buildMetadata(file, owner);
  return repository.save(metadata);
}

function listDocuments() {
  return repository.findAll().map(({ storedPath, ...rest }) => rest);
}

function getDocumentFile(id) {
  const doc = repository.findById(id);
  if (!doc) {
    return null;
  }
  if (!fs.existsSync(doc.storedPath)) {
    return null;
  }
  return {
    filePath: doc.storedPath,
    originalName: doc.originalName,
  };
}

module.exports = { uploadDocument, listDocuments, getDocumentFile };

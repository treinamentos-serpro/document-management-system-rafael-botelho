// Serviço responsável pelas regras de negócio dos documentos.
// Não acessa req/res — isso é responsabilidade do controller.

const { randomUUID } = require('crypto');
const repository = require('../repositories/documentRepository');

function saveDocument({ originalname, filename, size, owner }) {
  const metadata = {
    id: randomUUID(),
    originalName: originalname,
    filename,
    size,
    owner: owner || 'anonymous',
    uploadedAt: new Date().toISOString(),
  };
  return repository.save(metadata);
}

function listDocuments() {
  return repository.findAll();
}

function getDocumentById(id) {
  return repository.findById(id);
}

function getDocumentFilePath(document) {
  return repository.getFilePath(document.filename);
}

module.exports = { saveDocument, listDocuments, getDocumentById, getDocumentFilePath };

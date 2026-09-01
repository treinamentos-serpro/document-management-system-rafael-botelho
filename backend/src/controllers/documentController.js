'use strict';

// Controller de documentos: trata entrada HTTP e delega para o serviço.
// Responsabilidade única: validação HTTP e formatação da resposta.

const service = require('../services/documentService');

function upload(req, res) {
  try {
    const doc = service.uploadDocument(req.file, req.body.owner);
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

function list(req, res) {
  const docs = service.listDocuments();
  return res.json(docs);
}

function download(req, res) {
  const result = service.getDocumentFile(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }
  return res.download(result.filePath, result.originalName);
}

module.exports = { upload, list, download };

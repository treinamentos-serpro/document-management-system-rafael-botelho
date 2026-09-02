// Controller responsável por tratar as requisições HTTP e delegar ao service.

const service = require('../services/documentService');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const owner = req.body.owner;
  const document = service.saveDocument({ ...req.file, owner });
  return res.status(201).json(document);
}

function list(req, res) {
  const documents = service.listDocuments();
  return res.json(documents);
}

function download(req, res) {
  const { id } = req.params;
  const document = service.getDocumentById(id);

  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  const filePath = service.getDocumentFilePath(document);
  return res.download(filePath, document.originalName, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ error: 'Erro ao baixar o arquivo.' });
    }
  });
}

module.exports = { upload, list, download };

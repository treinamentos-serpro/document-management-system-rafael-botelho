const { DocumentNotFoundError } = require('../services/documentService');

function getOwner(req) {
  const owner = req.get('X-User-Id')?.trim();

  return owner || null;
}

function respondInvalidOwner(res) {
  return res.status(400).json({ error: 'O cabeçalho X-User-Id é obrigatório.' });
}

function createDocumentController(documentService) {
  return {
    upload(req, res) {
      const owner = getOwner(req);

      if (!owner) {
        return respondInvalidOwner(res);
      }

      if (!req.file) {
        return res.status(400).json({ error: 'O arquivo no campo file é obrigatório.' });
      }

      const document = documentService.createDocument(req.file, owner);

      return res.status(201).json(document);
    },

    list(req, res) {
      const owner = getOwner(req);

      if (!owner) {
        return respondInvalidOwner(res);
      }

      return res.json(documentService.listDocuments(owner));
    },

    download(req, res, next) {
      const owner = getOwner(req);

      if (!owner) {
        return respondInvalidOwner(res);
      }

      try {
        const document = documentService.getDocumentForDownload(req.params.id, owner);

        return res.download(document.storagePath, document.originalName, (error) => {
          if (!error) {
            return;
          }

          if (error.code === 'ENOENT') {
            if (!res.headersSent) {
              return res.status(404).json({ error: 'Documento não encontrado.' });
            }
            return;
          }

          next(error);
        });
      } catch (error) {
        if (error instanceof DocumentNotFoundError) {
          return res.status(404).json({ error: error.message });
        }

        return next(error);
      }
    },

    async remove(req, res, next) {
      const owner = getOwner(req);

      if (!owner) {
        return respondInvalidOwner(res);
      }

      try {
        await documentService.deleteDocument(req.params.id, owner);
        return res.status(204).send();
      } catch (error) {
        if (error instanceof DocumentNotFoundError) {
          return res.status(404).json({ error: error.message });
        }

        return next(error);
      }
    },
  };
}

module.exports = createDocumentController;
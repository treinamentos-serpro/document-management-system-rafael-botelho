const express = require('express');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
]);

function createDocumentRouter(documentController) {
  const storageDirectory = process.env.STORAGE_DIRECTORY
    || path.resolve(__dirname, '../../storage');

  fs.mkdirSync(storageDirectory, { recursive: true });

  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename(req, file, callback) {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(req, file, callback) {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const error = new Error('Tipo de arquivo não suportado.');
        error.code = 'UNSUPPORTED_MEDIA_TYPE';
        return callback(error);
      }

      return callback(null, true);
    },
  });

  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);
  router.delete('/documents/:id', documentController.remove);

  return router;
}

module.exports = createDocumentRouter;
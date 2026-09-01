'use strict';

// Rotas de documentos: registra endpoints e configura o middleware multer.

const express = require('express');
const path = require('path');
const multer = require('multer');
const controller = require('../controllers/documentController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../storage'),
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname);
    const unique = `${Date.now()}-${safeName}`;
    cb(null, unique);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;

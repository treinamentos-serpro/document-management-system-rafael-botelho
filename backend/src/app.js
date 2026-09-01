// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const multer = require('multer');
const DocumentRepository = require('./repositories/documentRepository');
const { DocumentService } = require('./services/documentService');
const createDocumentController = require('./controllers/documentController');
const createDocumentRouter = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
const documentController = createDocumentController(documentService);

app.use(express.json());

// Endpoint de verificação de saúde. As demais rotas (/upload, /documents,
// /documents/:id/download) serão implementadas durante o Passo 2.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(createDocumentRouter(documentController));

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'O arquivo excede o limite de 10 MiB.' });
  }

  if (error.code === 'UNSUPPORTED_MEDIA_TYPE') {
    return res.status(415).json({ error: error.message });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Upload inválido.' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Ocorreu um erro interno.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;

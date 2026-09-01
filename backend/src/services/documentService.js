const { randomUUID } = require('node:crypto');

class DocumentNotFoundError extends Error {}

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  createDocument(file, owner) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      mimeType: file.mimetype,
      storedName: file.filename,
      storagePath: file.path,
    };

    return this.toPublicMetadata(this.documentRepository.create(document));
  }

  listDocuments(owner) {
    return this.documentRepository
      .findByOwner(owner)
      .map((document) => this.toPublicMetadata(document));
  }

  getDocumentForDownload(id, owner) {
    const document = this.documentRepository.findById(id);

    if (!document || document.owner !== owner) {
      throw new DocumentNotFoundError('Documento não encontrado.');
    }

    return document;
  }

  toPublicMetadata(document) {
    const { id, originalName, size, uploadedAt, owner } = document;

    return { id, originalName, size, uploadedAt, owner };
  }
}

module.exports = { DocumentService, DocumentNotFoundError };
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');

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

  async deleteDocument(id, owner) {
    const document = this.getDocumentForDownload(id, owner);

    try {
      await fs.unlink(document.storagePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new DocumentNotFoundError('Documento não encontrado.');
      }

      throw error;
    }

    this.documentRepository.delete(id);
  }

  toPublicMetadata(document) {
    const { id, originalName, size, uploadedAt, owner } = document;

    return { id, originalName, size, uploadedAt, owner };
  }
}

module.exports = { DocumentService, DocumentNotFoundError };
import { useState } from 'react';
import { uploadDocument } from '../services/apiClient';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function UploadComponent({ userId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files[0] || null;
    setFile(selectedFile);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!userId.trim()) {
      setError('Informe seu identificador de usuário antes de enviar um arquivo.');
      return;
    }

    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Envie um arquivo PDF, PNG ou JPEG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('O arquivo deve ter no máximo 10 MiB.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const document = await uploadDocument(file, userId);
      onUploadSuccess(document);
      setFile(null);
      event.target.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="panel upload-panel" aria-labelledby="upload-title">
      <div>
        <p className="eyebrow">Novo documento</p>
        <h2 id="upload-title">Enviar arquivo</h2>
      </div>
      <form className="upload-form" onSubmit={handleSubmit}>
        <label className="file-input" htmlFor="document-file">
          <span>Selecione um PDF, PNG ou JPEG</span>
          <input
            id="document-file"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
          />
          <strong>{file ? file.name : 'Nenhum arquivo selecionado'}</strong>
        </label>
        {error && <p className="message error" role="alert">{error}</p>}
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}
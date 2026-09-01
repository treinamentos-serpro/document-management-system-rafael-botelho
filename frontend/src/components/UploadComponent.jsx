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
    <section className="border border-[#b8cec8] bg-white/90 p-5 shadow-[5px_5px_0_#d3e3dd] sm:p-6" aria-labelledby="upload-title">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b44729]">Novo documento</p>
        <h2 id="upload-title" className="font-display text-2xl font-normal text-[#18364d]">Enviar arquivo</h2>
      </div>
      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-bold text-[#36596a]" htmlFor="document-file">
          <span>Selecione um PDF, PNG ou JPEG</span>
          <input
            id="document-file"
            className="w-full cursor-pointer rounded border border-dashed border-[#99b5ad] bg-[#f6faf8] p-2 text-sm font-normal file:mr-3 file:rounded file:border-0 file:bg-[#d8e9e3] file:px-3 file:py-1.5 file:font-sans file:font-bold file:text-[#205a60] hover:file:bg-[#c9ded6]"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={handleFileChange}
          />
          <strong className="overflow-wrap-anywhere text-sm text-[#18364d]">{file ? file.name : 'Nenhum arquivo selecionado'}</strong>
        </label>
        {error && <p className="text-sm font-semibold text-[#a32d1d]" role="alert">{error}</p>}
        <button className="rounded bg-[#b44729] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#92321d] focus:outline-none focus:ring-2 focus:ring-[#b44729] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65" type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>
    </section>
  );
}
import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList';
import UploadComponent from './components/UploadComponent';
import { getDocuments } from './services/apiClient';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState('usuario-demo');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadDocuments() {
    if (!userId.trim()) {
      setDocuments([]);
      setError('Informe um identificador de usuário para consultar documentos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      setDocuments(await getDocuments(userId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [userId]);

  function handleUploadSuccess(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
  }

  function handleDelete(documentId) {
    setDocuments((currentDocuments) => (
      currentDocuments.filter((document) => document.id !== documentId)
    ));
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-7 flex flex-col gap-6 border-b border-[#b8cec8] pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.08em] text-[#b44729]">Document Management System</p>
          <h1 className="max-w-xl font-display text-4xl font-normal leading-none text-[#18364d] sm:text-5xl">Seus arquivos, à mão.</h1>
        </div>
        <label className="grid w-full gap-2 font-sans text-sm font-bold text-[#36596a] lg:w-72" htmlFor="user-id">
          Identificador do usuário
          <input
            id="user-id"
            className="w-full rounded border border-[#99b5ad] bg-white px-3 py-2.5 text-base font-normal text-[#18364d] outline-none transition focus:border-[#206066] focus:ring-2 focus:ring-[#206066]/20"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Ex.: rafael"
          />
        </label>
      </header>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.4fr)]">
        <UploadComponent userId={userId} onUploadSuccess={handleUploadSuccess} />
        <DocumentList
          documents={documents}
          userId={userId}
          isLoading={isLoading}
          error={error}
          onRefresh={loadDocuments}
          onDelete={handleDelete}
          onError={setError}
        />
      </div>
    </main>
  );
}

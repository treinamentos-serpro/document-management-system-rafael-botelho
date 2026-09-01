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

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Document Management System</p>
          <h1>Seus arquivos, à mão.</h1>
        </div>
        <label className="user-control" htmlFor="user-id">
          Identificador do usuário
          <input
            id="user-id"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Ex.: rafael"
          />
        </label>
      </header>
      <div className="content-grid">
        <UploadComponent userId={userId} onUploadSuccess={handleUploadSuccess} />
        <DocumentList
          documents={documents}
          userId={userId}
          isLoading={isLoading}
          error={error}
          onRefresh={loadDocuments}
          onError={setError}
        />
      </div>
    </main>
  );
}

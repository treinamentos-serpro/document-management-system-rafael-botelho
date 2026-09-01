import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUploadDate(uploadedAt) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(uploadedAt));
}

export default function DocumentList({ documents, userId, isLoading, error, onRefresh, onError }) {
  return (
    <section className="panel document-panel" aria-labelledby="documents-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2 id="documents-title">Meus documentos</h2>
        </div>
        <button className="refresh-button" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      {error && <p className="message error" role="alert">{error}</p>}
      {isLoading ? (
        <p className="empty-state">Carregando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="empty-state">Ainda não há documentos para este usuário.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tamanho</th>
                <th scope="col">Enviado em</th>
                <th scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td><strong>{document.originalName}</strong></td>
                  <td>{formatFileSize(document.size)}</td>
                  <td>{formatUploadDate(document.uploadedAt)}</td>
                  <td>
                    <DownloadButton
                      documentId={document.id}
                      originalName={document.originalName}
                      userId={userId}
                      onError={onError}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
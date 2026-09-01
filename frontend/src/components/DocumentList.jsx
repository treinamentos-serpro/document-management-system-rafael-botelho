import DownloadButton from './DownloadButton';
import DeleteButton from './DeleteButton';

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

export default function DocumentList({ documents, userId, isLoading, error, onRefresh, onDelete, onError }) {
  return (
    <section className="border border-[#b8cec8] bg-white/90 p-5 shadow-[5px_5px_0_#d3e3dd] sm:p-6" aria-labelledby="documents-title">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#b44729]">Biblioteca</p>
          <h2 id="documents-title" className="font-display text-2xl font-normal text-[#18364d]">Meus documentos</h2>
        </div>
        <button className="rounded border border-[#206066] px-3 py-2 text-sm font-bold text-[#206066] transition hover:bg-[#206066] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#206066] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65" type="button" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>
      {error && <p className="mb-4 text-sm font-semibold text-[#a32d1d]" role="alert">{error}</p>}
      {isLoading ? (
        <p className="py-10 text-center text-sm text-[#54757c]">Carregando documentos...</p>
      ) : documents.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#54757c]">Ainda não há documentos para este usuário.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-y border-[#d8e5e0] text-xs uppercase tracking-[0.04em] text-[#54757c]">
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">Tamanho</th>
                <th scope="col">Enviado em</th>
                <th className="px-2 py-3 text-right" scope="col"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr className="border-b border-[#d8e5e0] text-[#36596a]" key={document.id}>
                  <td className="max-w-52 overflow-hidden px-2 py-3 text-ellipsis font-semibold text-[#18364d]"><strong>{document.originalName}</strong></td>
                  <td className="whitespace-nowrap px-2 py-3">{formatFileSize(document.size)}</td>
                  <td className="whitespace-nowrap px-2 py-3">{formatUploadDate(document.uploadedAt)}</td>
                  <td className="px-0 py-3 text-right">
                    <div className="flex justify-end gap-2">
                    <DownloadButton
                      documentId={document.id}
                      originalName={document.originalName}
                      userId={userId}
                      onError={onError}
                    />
                      <DeleteButton
                        documentId={document.id}
                        originalName={document.originalName}
                        userId={userId}
                        onDelete={onDelete}
                        onError={onError}
                      />
                    </div>
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
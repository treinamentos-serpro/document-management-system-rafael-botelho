import { useState } from 'react';
import { deleteDocument } from '../services/apiClient';

export default function DeleteButton({ documentId, originalName, userId, onDelete, onError }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Excluir o documento ${originalName}?`);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteDocument(documentId, userId);
      onDelete(documentId);
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="rounded border border-[#b44729] px-3 py-1.5 text-sm font-bold text-[#b44729] transition hover:bg-[#b44729] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#b44729] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Excluindo...' : 'Excluir'}
    </button>
  );
}
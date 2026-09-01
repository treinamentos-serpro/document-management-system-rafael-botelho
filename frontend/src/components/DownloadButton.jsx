import { useState } from 'react';
import { downloadDocument } from '../services/apiClient';

export default function DownloadButton({ documentId, originalName, userId, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);

    try {
      const file = await downloadDocument(documentId, userId);
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      className="rounded border border-[#206066] px-3 py-1.5 text-sm font-bold text-[#206066] transition hover:bg-[#206066] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#206066] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? 'Preparando...' : 'Baixar'}
    </button>
  );
}
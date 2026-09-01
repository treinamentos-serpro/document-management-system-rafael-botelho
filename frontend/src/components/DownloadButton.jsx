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
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? 'Preparando...' : 'Baixar'}
    </button>
  );
}
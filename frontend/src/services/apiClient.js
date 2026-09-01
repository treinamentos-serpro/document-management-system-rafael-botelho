const API_BASE_URL = '/api';

function createUserHeaders(userId) {
  return { 'X-User-Id': userId.trim() };
}

async function getErrorMessage(response) {
  const responseBody = await response.json().catch(() => null);

  return responseBody?.error || 'Não foi possível concluir a solicitação.';
}

async function request(url, options) {
  const response = await fetch(`${API_BASE_URL}${url}`, options);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    headers: createUserHeaders(userId),
    body: formData,
  });

  return response.json();
}

export async function getDocuments(userId) {
  const response = await request('/documents', {
    headers: createUserHeaders(userId),
  });

  return response.json();
}

export async function downloadDocument(documentId, userId) {
  const response = await request(`/documents/${documentId}/download`, {
    headers: createUserHeaders(userId),
  });

  return response.blob();
}

export async function deleteDocument(documentId, userId) {
  await request(`/documents/${documentId}`, {
    method: 'DELETE',
    headers: createUserHeaders(userId),
  });
}
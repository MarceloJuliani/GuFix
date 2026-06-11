const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function readApiError(response: Response, fallbackMessage: string) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    return data?.error || fallbackMessage;
  }

  const text = await response.text().catch(() => '');
  if (response.status === 404 && /This Page Does Not Exist|<html|<!doctype html/i.test(text)) {
    return 'API do GuFix nao esta ativa neste dominio. Publique o backend ou configure VITE_API_BASE_URL.';
  }

  if (response.status >= 500) {
    return 'Servidor indisponivel no momento. Verifique a API e a conexao com o MySQL.';
  }

  return fallbackMessage;
}

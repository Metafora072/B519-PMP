const DEFAULT_API_BASE_URL = "http://localhost:3001";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}


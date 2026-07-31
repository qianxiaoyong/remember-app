const TOKEN_STORAGE_KEY = 'remember.admin.token';

function readOptionalEnvString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function readAdminApiBaseUrl(): string {
  const configured = readOptionalEnvString(import.meta.env.VITE_API_BASE_URL);
  if (configured) {
    return configured.replace(/\/$/, '');
  }
  return '';
}

export function readStoredAdminToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeAdminToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredAdminToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export interface AdminApiErrorBody {
  code?: string;
  message?: string;
}

export class AdminApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, body: AdminApiErrorBody) {
    super(body.message ?? '请求失败');
    this.status = status;
    this.code = body.code;
  }
}

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = readAdminApiBaseUrl();
  const url = `${base}/api/v1${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = readStoredAdminToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}

export async function adminFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await adminFetch(path, init);
  if (!response.ok) {
    let body: AdminApiErrorBody = {};
    try {
      body = (await response.json()) as AdminApiErrorBody;
    } catch {
      // 非 JSON 错误体时使用空对象
    }
    throw new AdminApiError(response.status, body);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

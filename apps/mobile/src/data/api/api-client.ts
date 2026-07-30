import Constants from 'expo-constants';

const API_TIMEOUT_MS = 10_000;

function readApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra.replace(/\/$/, '');
  }

  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
  if (typeof fromEnv === 'string') {
    const baseUrl = fromEnv.trim().replace(/\/$/, '');
    if (baseUrl) {
      return baseUrl;
    }
  }

  throw new Error('EXPO_PUBLIC_API_BASE_URL is not configured');
}

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class ApiNetworkError extends Error {
  constructor(message = '无法连接服务器') {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

function toApiNetworkError(error: unknown): ApiNetworkError {
  if (error instanceof ApiNetworkError) {
    return error;
  }
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new ApiNetworkError('连接服务器超时');
    }
    if (error.message.toLowerCase().includes('network')) {
      return new ApiNetworkError();
    }
  }
  return new ApiNetworkError();
}

export async function apiFetch(
  path: string,
  init: RequestInit & { sessionToken?: string | null } = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (init.sessionToken) {
    headers.set('Authorization', `Bearer ${init.sessionToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(`${readApiBaseUrl()}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    throw toApiNetworkError(error);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function apiFetchJson<T>(
  path: string,
  init: RequestInit & { sessionToken?: string | null } = {},
): Promise<T> {
  const response = await apiFetch(path, init);
  const payload = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      payload.code ?? 'REQUEST_FAILED',
      payload.message ?? '请求失败',
    );
  }

  return payload as T;
}

interface CachedAdminToken {
  token: string;
  expiresAtMs: number;
}

let cachedToken: CachedAdminToken | null = null;

function readLexiconApiBaseUrl(): string {
  return process.env.LEXICON_API_BASE_URL?.trim() ?? 'http://127.0.0.1:3000';
}

function readConfiguredBearerToken(): string | null {
  const token = process.env.LEXICON_ADMIN_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

async function loginForAdminToken(): Promise<string> {
  const loginName =
    process.env.LEXICON_ADMIN_LOGIN?.trim() ??
    process.env.ADMIN_BOOTSTRAP_LOGIN_NAME?.trim() ??
    'admin';
  const password =
    process.env.LEXICON_ADMIN_PASSWORD?.trim() ?? process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  if (!password) {
    throw new Error(
      '未配置中心词库鉴权：请设置 LEXICON_ADMIN_TOKEN，或 LEXICON_ADMIN_PASSWORD（可与 apps/api/.env 一致）',
    );
  }

  const response = await fetch(`${readLexiconApiBaseUrl()}/api/v1/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginName, password }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `Admin 登录失败 (${String(response.status)})`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('Admin 登录响应缺少 token');
  }

  cachedToken = {
    token: data.token,
    expiresAtMs: Date.now() + 50 * 60 * 1000,
  };
  return data.token;
}

export async function resolveAdminBearerToken(): Promise<string> {
  const configured = readConfiguredBearerToken();
  if (configured) {
    return configured;
  }
  if (cachedToken && cachedToken.expiresAtMs > Date.now()) {
    return cachedToken.token;
  }
  return loginForAdminToken();
}

export async function proxyAdminLexiconRequest(
  pathWithQuery: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await resolveAdminBearerToken();
  const url = `${readLexiconApiBaseUrl()}/api/v1/admin/lexicon${pathWithQuery}`;
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  if (response.status !== 401 || readConfiguredBearerToken()) {
    return response;
  }

  cachedToken = null;
  const retryToken = await loginForAdminToken();
  headers.set('Authorization', `Bearer ${retryToken}`);
  return fetch(url, { ...init, headers });
}

export interface AdminAuthConfig {
  sessionTtlDays: number;
  bootstrapLoginName: string;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

export function readAdminAuthConfig(): AdminAuthConfig {
  const sessionTtlDaysRaw = process.env.ADMIN_SESSION_TTL_DAYS?.trim();
  const sessionTtlDays = sessionTtlDaysRaw ? Number(sessionTtlDaysRaw) : 7;
  if (!Number.isFinite(sessionTtlDays) || sessionTtlDays <= 0) {
    throw new Error('ADMIN_SESSION_TTL_DAYS must be a positive number');
  }

  const bootstrapLoginName = process.env.ADMIN_BOOTSTRAP_LOGIN_NAME?.trim() || 'admin';
  if (bootstrapLoginName.length === 0) {
    throw new Error('ADMIN_BOOTSTRAP_LOGIN_NAME must not be empty');
  }

  return {
    sessionTtlDays,
    bootstrapLoginName,
  };
}

export function readAdminBootstrapPassword(): string | null {
  const value = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

export function requireAdminBootstrapPassword(): string {
  return readRequiredEnv('ADMIN_BOOTSTRAP_PASSWORD');
}

export interface AuthConfig {
  phonePepper: string;
  smsMockEnabled: boolean;
  sessionTtlDays: number;
  smsResendIntervalMs: number;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return defaultValue;
  }
  if (raw === 'true' || raw === '1') {
    return true;
  }
  if (raw === 'false' || raw === '0') {
    return false;
  }
  throw new Error(`${name} must be true or false`);
}

export function readAuthConfig(): AuthConfig {
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const smsMockEnabled = readBooleanEnv('SMS_MOCK_ENABLED', false);

  if (nodeEnv === 'production' && smsMockEnabled) {
    throw new Error('SMS_MOCK_ENABLED must not be enabled in production');
  }

  const sessionTtlDaysRaw = process.env.AUTH_SESSION_TTL_DAYS?.trim();
  const sessionTtlDays = sessionTtlDaysRaw ? Number(sessionTtlDaysRaw) : 90;
  if (!Number.isFinite(sessionTtlDays) || sessionTtlDays <= 0) {
    throw new Error('AUTH_SESSION_TTL_DAYS must be a positive number');
  }

  const smsResendIntervalMsRaw = process.env.AUTH_SMS_RESEND_INTERVAL_MS?.trim();
  const smsResendIntervalMs = smsResendIntervalMsRaw ? Number(smsResendIntervalMsRaw) : 60_000;
  if (!Number.isFinite(smsResendIntervalMs) || smsResendIntervalMs < 0) {
    throw new Error('AUTH_SMS_RESEND_INTERVAL_MS must be a non-negative number');
  }

  return {
    phonePepper: readRequiredEnv('AUTH_PHONE_PEPPER'),
    smsMockEnabled,
    sessionTtlDays,
    smsResendIntervalMs,
  };
}

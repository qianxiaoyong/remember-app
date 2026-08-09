import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEST_REDEMPTION_PEPPER } from './catalog-test-helper.js';

function loadApiDotEnvIfNeeded(): void {
  if (process.env.DATABASE_URL?.trim()) {
    return;
  }
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '../../.env');
  if (!existsSync(envPath)) {
    return;
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    process.env[key] ??= value;
  }
}

/** 集成测试 env：在 AppModule 编译前调用；覆盖本地 .env 中与 seed 冲突的项。 */
export function applyIntegrationTestEnv(): void {
  loadApiDotEnvIfNeeded();
  process.env.AUTH_PHONE_PEPPER ??= 'integration-test-pepper';
  process.env.SMS_MOCK_ENABLED ??= 'true';
  process.env.AUTH_SMS_RESEND_INTERVAL_MS ??= '0';
  process.env.REDEMPTION_CODE_PEPPER = TEST_REDEMPTION_PEPPER;
  process.env.PACK_DOWNLOAD_TOKEN_PEPPER ??= 'integration-download-pepper';
  process.env.WECHAT_PAY_MOCK_ENABLED ??= 'true';
  process.env.WECHAT_PAY_MOCK_NOTIFY_SECRET ??= 'integration-mock-notify-secret';
  process.env.PACK_DOWNLOAD_MOCK_ENABLED ??= 'true';
  process.env.API_PUBLIC_BASE_URL ??= 'http://127.0.0.1:3000';
  process.env.ADMIN_SESSION_TTL_DAYS ??= '7';
  process.env.ADMIN_BOOTSTRAP_LOGIN_NAME ??= 'admin';
  process.env.ADMIN_BOOTSTRAP_PASSWORD ??= 'integration-admin-password';
}

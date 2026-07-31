import { TEST_REDEMPTION_PEPPER } from './catalog-test-helper.js';

/** 集成测试 env：在 AppModule 编译前调用；覆盖本地 .env 中与 seed 冲突的项。 */
export function applyIntegrationTestEnv(): void {
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

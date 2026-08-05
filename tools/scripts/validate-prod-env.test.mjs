import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { loadEnvFile, validateProdEnv } from './validate-prod-env.mjs';

const stagingPassword = 'staging-password';
const validStagingEnv = {
  POSTGRES_DB: 'remember',
  POSTGRES_USER: 'remember',
  POSTGRES_PASSWORD: stagingPassword,
  DATABASE_URL: `postgresql://remember:${stagingPassword}@postgres:5432/remember`,
  NODE_ENV: 'staging',
  PORT: '3000',
  API_PUBLIC_BASE_URL: 'https://api.staging.remember.wehub.top',
  AUTH_PHONE_PEPPER: 'staging-phone-pepper',
  REDEMPTION_CODE_PEPPER: 'staging-redemption-pepper',
  PACK_DOWNLOAD_TOKEN_PEPPER: 'staging-download-pepper',
  ADMIN_BOOTSTRAP_LOGIN_NAME: 'admin',
  ADMIN_BOOTSTRAP_PASSWORD: 'staging-admin-password',
  SMS_MOCK_ENABLED: 'true',
  PACK_DOWNLOAD_MOCK_ENABLED: 'true',
  COS_ENABLED: 'false',
};

test('validateProdEnv accepts complete staging env', () => {
  const result = validateProdEnv(validStagingEnv);
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('validateProdEnv rejects missing required keys', () => {
  const result = validateProdEnv({ NODE_ENV: 'staging' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith('MISSING: AUTH_PHONE_PEPPER')));
});

test('validateProdEnv rejects production with SMS mock', () => {
  const result = validateProdEnv({
    ...validStagingEnv,
    NODE_ENV: 'production',
    SMS_MOCK_ENABLED: 'true',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('SMS_MOCK_ENABLED')));
});

test('validateProdEnv requires COS when production disables pack download mock', () => {
  const result = validateProdEnv({
    ...validStagingEnv,
    NODE_ENV: 'production',
    SMS_MOCK_ENABLED: 'false',
    PACK_DOWNLOAD_MOCK_ENABLED: 'false',
    COS_ENABLED: 'false',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('COS_ENABLED=true')));
});

test('validateProdEnv requires COS credentials when COS_ENABLED=true', () => {
  const result = validateProdEnv({
    ...validStagingEnv,
    COS_ENABLED: 'true',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.startsWith('MISSING: COS_SECRET_ID')));
});

test('loadEnvFile loads keys without overwriting existing process env', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'remember-prod-env-'));
  const envPath = path.join(dir, '.env');
  await writeFile(
    envPath,
    ['CUSTOM_FROM_FILE=from-file', 'PRESERVED=from-file'].join('\n'),
    'utf8',
  );

  const env = { PRESERVED: 'existing' };
  loadEnvFile(envPath, env);
  assert.equal(env.CUSTOM_FROM_FILE, 'from-file');
  assert.equal(env.PRESERVED, 'existing');
});

test('infra/prod/.env.example intentionally fails validation', () => {
  const result = validateProdEnv({
    POSTGRES_DB: 'remember',
    POSTGRES_USER: 'remember',
    NODE_ENV: 'staging',
    PORT: '3000',
    API_PUBLIC_BASE_URL: 'https://api.staging.remember.wehub.top',
    SMS_MOCK_ENABLED: 'true',
    PACK_DOWNLOAD_MOCK_ENABLED: 'true',
    COS_ENABLED: 'false',
  });
  assert.equal(result.ok, false);
});

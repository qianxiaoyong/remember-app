import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_KEYS = [
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'DATABASE_URL',
  'NODE_ENV',
  'PORT',
  'API_PUBLIC_BASE_URL',
  'AUTH_PHONE_PEPPER',
  'REDEMPTION_CODE_PEPPER',
  'PACK_DOWNLOAD_TOKEN_PEPPER',
  'ADMIN_BOOTSTRAP_LOGIN_NAME',
  'ADMIN_BOOTSTRAP_PASSWORD',
];

const COS_KEYS = ['COS_SECRET_ID', 'COS_SECRET_KEY', 'COS_REGION', 'COS_BUCKET'];

const ALLOWED_NODE_ENV = new Set(['staging', 'production']);

/** @param {string} path @param {NodeJS.ProcessEnv} target */
export function loadEnvFile(path, target = process.env) {
  if (!existsSync(path)) {
    throw new Error(`ENV_FILE_NOT_FOUND: ${path}`);
  }

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
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
    if (!(key in target)) {
      target[key] = value;
    }
  }
}

/** @param {NodeJS.ProcessEnv} env */
export function validateProdEnv(env) {
  /** @type {string[]} */
  const errors = [];

  for (const key of REQUIRED_KEYS) {
    if (!env[key]?.trim()) {
      errors.push(`MISSING: ${key}`);
    }
  }

  const nodeEnv = env.NODE_ENV?.trim().toLowerCase();
  if (nodeEnv && !ALLOWED_NODE_ENV.has(nodeEnv)) {
    errors.push(`INVALID: NODE_ENV must be staging or production (got ${env.NODE_ENV})`);
  }

  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl?.includes('CHANGE_ME')) {
    errors.push('INVALID: DATABASE_URL must not contain CHANGE_ME placeholder');
  }

  if (nodeEnv === 'production' && env.SMS_MOCK_ENABLED?.trim().toLowerCase() === 'true') {
    errors.push('INVALID: SMS_MOCK_ENABLED must not be true when NODE_ENV=production');
  }

  const cosEnabled = env.COS_ENABLED?.trim().toLowerCase() === 'true';
  const mockDownload = env.PACK_DOWNLOAD_MOCK_ENABLED?.trim().toLowerCase() !== 'false';

  if (nodeEnv === 'production' && !mockDownload && !cosEnabled) {
    errors.push('INVALID: production pack download requires COS_ENABLED=true when mock is off');
  }

  if (cosEnabled) {
    for (const key of COS_KEYS) {
      if (!env[key]?.trim()) {
        errors.push(`MISSING: ${key} (required when COS_ENABLED=true)`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

function runCli() {
  const envPath = process.argv[2] ?? 'infra/prod/.env';
  const env = { ...process.env };
  loadEnvFile(envPath, env);
  const result = validateProdEnv(env);

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exit(1);
  }

  console.log(`OK: prod env validated (${envPath})`);
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  runCli();
}

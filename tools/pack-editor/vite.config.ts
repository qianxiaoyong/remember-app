import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { localApiPlugin } from './src/server/local-api-plugin.js';

const packEditorRoot = dirname(fileURLToPath(import.meta.url));

function applyEnvFile(filePath: string, overwrite = false): void {
  if (!existsSync(filePath)) {
    return;
  }
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (overwrite || !process.env[key]?.trim()) {
      process.env[key] = value;
    }
  }
}

function bootstrapLexiconEnv(mode: string): void {
  loadEnv(mode, packEditorRoot, '');
  applyEnvFile(resolve(packEditorRoot, '.env'));
  applyEnvFile(resolve(packEditorRoot, '../../apps/api/.env'));
  if (!process.env.LEXICON_ADMIN_PASSWORD?.trim() && process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim()) {
    process.env.LEXICON_ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD.trim();
  }
  if (!process.env.LEXICON_ADMIN_LOGIN?.trim() && process.env.ADMIN_BOOTSTRAP_LOGIN_NAME?.trim()) {
    process.env.LEXICON_ADMIN_LOGIN = process.env.ADMIN_BOOTSTRAP_LOGIN_NAME.trim();
  }
  if (!process.env.LEXICON_API_BASE_URL?.trim()) {
    process.env.LEXICON_API_BASE_URL = 'http://127.0.0.1:3000';
  }
}

export default defineConfig(({ mode }) => {
  bootstrapLexiconEnv(mode);

  return {
    plugins: [react(), localApiPlugin()],
    server: {
      host: '127.0.0.1',
      port: 5174,
    },
  };
});

import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const apiDir = resolve(root, 'apps/api');
const schemaPath = resolve(apiDir, 'prisma/schema.prisma');
const clientEntry = resolve(root, 'node_modules/.prisma/client/index.js');
const stampPath = resolve(apiDir, '.cache/prisma-schema.sha256');

function readSchemaHash() {
  return createHash('sha256').update(readFileSync(schemaPath)).digest('hex');
}

function readStamp() {
  try {
    return readFileSync(stampPath, 'utf8').trim();
  } catch {
    return null;
  }
}

function writeStamp(hash) {
  mkdirSync(dirname(stampPath), { recursive: true });
  writeFileSync(stampPath, hash);
}

const schemaHash = readSchemaHash();
if (existsSync(clientEntry) && readStamp() === schemaHash) {
  process.exit(0);
}

try {
  execSync('pnpm exec prisma generate', { cwd: apiDir, stdio: 'inherit' });
  writeStamp(schemaHash);
  process.exit(0);
} catch {
  if (existsSync(clientEntry)) {
    console.warn(
      'ensure-prisma-client: prisma generate failed but an existing client was found; continuing',
    );
    process.exit(0);
  }
  process.exit(1);
}

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const secretlintIgnorePath = path.join(repoRoot, '.secretlintignore');

const binaryExtensions = new Set([
  '.zip',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.mp3',
  '.wav',
  '.sqlite',
  '.pdf',
  '.apk',
]);

function readIgnorePatterns() {
  try {
    return readFileSync(secretlintIgnorePath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  } catch {
    return [];
  }
}

function normalizeRelativePath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function isIgnoredPath(relativePath, ignorePatterns) {
  for (const pattern of ignorePatterns) {
    const normalized = pattern.endsWith('/') ? pattern : `${pattern}/`;
    if (relativePath === pattern || relativePath.startsWith(normalized)) {
      return true;
    }
    if (pattern.endsWith('/') && relativePath.startsWith(pattern)) {
      return true;
    }
  }
  return false;
}

export function filterSecretlintTargets(files, ignorePatterns = readIgnorePatterns()) {
  return files.filter((filePath) => {
    const relativePath = normalizeRelativePath(filePath);
    if (isIgnoredPath(relativePath, ignorePatterns)) {
      return false;
    }
    const extension = path.extname(relativePath).toLowerCase();
    if (binaryExtensions.has(extension)) {
      return false;
    }
    return true;
  });
}

export function resolveSecretlintDiffArgs(env = process.env) {
  if (env.SECRETLINT_ALL === '1') {
    return null;
  }

  const before = env.GITHUB_BEFORE ?? env.SECRETLINT_BASE_SHA;
  const after = env.GITHUB_SHA ?? 'HEAD';
  if (
    env.GITHUB_EVENT_NAME === 'push' &&
    before &&
    before !== '0000000000000000000000000000000000000000'
  ) {
    return ['diff', '--name-only', '--diff-filter=ACMRTUXB', before, after];
  }

  const baseRef = env.SECRETLINT_BASE_REF ?? 'origin/main';
  return ['diff', '--name-only', '--diff-filter=ACMRTUXB', `${baseRef}...HEAD`];
}

export function listChangedFiles(env = process.env) {
  const diffArgs = resolveSecretlintDiffArgs(env);
  if (diffArgs === null) {
    return null;
  }

  const files = new Set();

  function addFromGit(args) {
    try {
      const output = execFileSync('git', args, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      for (const line of output.split('\n')) {
        const trimmed = line.trim();
        if (trimmed) {
          files.add(trimmed);
        }
      }
    } catch {
      // Ignore missing refs or empty diffs.
    }
  }

  addFromGit(diffArgs);

  if (!env.CI) {
    addFromGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD']);
    addFromGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', '--cached']);
  }

  return [...files];
}

export function runSecretlintCheck(options = {}) {
  const env = options.env ?? process.env;
  const spawn = options.spawn ?? spawnSync;
  const cwd = options.cwd ?? repoRoot;
  const changedFiles = listChangedFiles(env);

  if (changedFiles === null) {
    return spawn('pnpm', ['exec', 'secretlint', '**/*'], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
  }

  const targets = filterSecretlintTargets(changedFiles);
  if (targets.length === 0) {
    if (options.log !== false) {
      console.log('check-secrets: no scannable changed files, skip');
    }
    return { status: 0 };
  }

  if (options.log !== false) {
    console.log(`check-secrets: scanning ${String(targets.length)} changed file(s)`);
  }

  return spawn('pnpm', ['exec', 'secretlint', ...targets], {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const env = { ...process.env };
  if (process.argv.includes('--all')) {
    env.SECRETLINT_ALL = '1';
  }
  const result = runSecretlintCheck({ env });
  process.exit(result.status ?? 1);
}

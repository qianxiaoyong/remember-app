import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ignoredDirs = new Set([
  '.git',
  '.expo',
  'android',
  'coverage',
  'dist',
  'ios',
  'node_modules',
]);
const sourceExtensions = new Set(['.cjs', '.js', '.mjs', '.ts', '.tsx']);
const forbiddenLocks = new Set(['package-lock.json', 'yarn.lock']);
const patterns = [
  { rule: 'COMMONJS_REQUIRE', value: /\brequire\s*\(/g },
  {
    rule: 'UNTRACKED_NOTE',
    value: new RegExp('\\b(?:TO' + 'DO|FIX' + 'ME|HA' + 'CK)\\b(?!\\s*#\\d+)', 'g'),
  },
  { rule: 'FOCUSED_TEST', value: /\.(?:only|skip)\s*\(/g },
];
const commonJsRequireAllowedPrefixes = ['apps/mobile/plugins/'];

function findLine(text, index) {
  return text.slice(0, index).split('\n').length;
}

async function listFiles(rootPath, currentPath = rootPath) {
  const files = [];
  for (const entry of await readdir(currentPath, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;

    const entryPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(rootPath, entryPath)));
    else files.push(entryPath);
  }
  return files;
}

export async function scanProject(rootPath) {
  const issues = [];
  for (const filePath of await listFiles(rootPath)) {
    const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');
    const fileName = path.basename(filePath);
    const hasExtraPnpmLock = fileName === 'pnpm-lock.yaml' && relativePath !== 'pnpm-lock.yaml';
    if (forbiddenLocks.has(fileName) || hasExtraPnpmLock) {
      issues.push({ path: relativePath, line: 1, rule: 'ONLY_PNPM_LOCK' });
      continue;
    }
    if (!sourceExtensions.has(path.extname(filePath)) || filePath.includes('.generated.')) continue;

    const text = await readFile(filePath, 'utf8');
    const textWithoutFinalNewline = text.endsWith('\n') ? text.slice(0, -1) : text;
    if (textWithoutFinalNewline.split('\n').length > 400) {
      issues.push({ path: relativePath, line: 401, rule: 'SOURCE_TOO_LONG' });
    }
    for (const pattern of patterns) {
      if (
        pattern.rule === 'COMMONJS_REQUIRE' &&
        commonJsRequireAllowedPrefixes.some((prefix) => relativePath.startsWith(prefix))
      ) {
        continue;
      }
      for (const match of text.matchAll(pattern.value)) {
        issues.push({ path: relativePath, line: findLine(text, match.index), rule: pattern.rule });
      }
    }
  }
  return issues;
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const issues = await scanProject(process.cwd());
  for (const issue of issues) console.error(`${issue.path}:${issue.line} ${issue.rule}`);
  if (issues.length > 0) process.exitCode = 1;
}

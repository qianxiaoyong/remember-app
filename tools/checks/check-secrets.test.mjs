import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  filterSecretlintTargets,
  listChangedFiles,
  resolveSecretlintDiffArgs,
} from './check-secrets.mjs';

test('resolveSecretlintDiffArgs 默认对比 origin/main', () => {
  assert.deepEqual(resolveSecretlintDiffArgs({}), [
    'diff',
    '--name-only',
    '--diff-filter=ACMRTUXB',
    'origin/main...HEAD',
  ]);
});

test('resolveSecretlintDiffArgs push 事件对比 before/after', () => {
  assert.deepEqual(
    resolveSecretlintDiffArgs({
      GITHUB_EVENT_NAME: 'push',
      GITHUB_BEFORE: 'abc123',
      GITHUB_SHA: 'def456',
    }),
    ['diff', '--name-only', '--diff-filter=ACMRTUXB', 'abc123', 'def456'],
  );
});

test('resolveSecretlintDiffArgs SECRETLINT_ALL 走全量', () => {
  assert.equal(resolveSecretlintDiffArgs({ SECRETLINT_ALL: '1' }), null);
});

test('filterSecretlintTargets 忽略 imports 与二进制', () => {
  const ignorePatterns = ['imports/', 'tools/pack-builder/cache/'];
  const targets = filterSecretlintTargets(
    [
      'apps/mobile/src/foo.ts',
      'imports/book.pdf',
      'tools/pack-builder/cache/ocr.txt',
      'apps/api/data/media/cover.png',
      'README.md',
    ],
    ignorePatterns,
  );
  assert.deepEqual(targets, ['apps/mobile/src/foo.ts', 'README.md']);
});

test('listChangedFiles 使用注入的 git 输出', () => {
  const files = listChangedFiles({
    SECRETLINT_BASE_REF: 'origin/main',
  });
  assert.ok(Array.isArray(files));
});

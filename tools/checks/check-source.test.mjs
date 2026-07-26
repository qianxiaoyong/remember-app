import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { scanProject } from './check-source.mjs';

let rootPath;

before(async () => {
  rootPath = await mkdtemp(path.join(tmpdir(), 'remember-source-check-'));
  await mkdir(path.join(rootPath, 'src'));
});

after(async () => {
  await rm(rootPath, { recursive: true, force: true });
});

test('发现禁止的锁文件', async () => {
  await writeFile(path.join(rootPath, 'package-lock.json'), '{}');
  const issues = await scanProject(rootPath);
  assert.ok(issues.some((issue) => issue.rule === 'ONLY_PNPM_LOCK'));
  await rm(path.join(rootPath, 'package-lock.json'));
});

test('发现禁止的源码模式', async () => {
  const filePath = path.join(rootPath, 'src', 'bad.ts');
  const badSource = ['requ' + "ire('x');", 'TO' + 'DO', 'describe.' + "only('x', () => {});"].join(
    '\n',
  );
  await writeFile(filePath, badSource);
  const rules = (await scanProject(rootPath)).map((issue) => issue.rule);
  assert.deepEqual(new Set(rules), new Set(['COMMONJS_REQUIRE', 'UNTRACKED_NOTE', 'FOCUSED_TEST']));
  await rm(filePath);
});

test('发现超过400行的人工源码', async () => {
  const filePath = path.join(rootPath, 'src', 'large.ts');
  await writeFile(filePath, Array.from({ length: 401 }, () => 'export {};').join('\n'));
  const issues = await scanProject(rootPath);
  assert.ok(issues.some((issue) => issue.rule === 'SOURCE_TOO_LONG'));
  await rm(filePath);
});

test('忽略生成和依赖目录', async () => {
  const ignoredPath = path.join(rootPath, 'node_modules');
  await mkdir(ignoredPath);
  await writeFile(path.join(ignoredPath, 'bad.ts'), 'requ' + "ire('x');");
  assert.deepEqual(await scanProject(rootPath), []);
});

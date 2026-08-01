import { existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const packEditorRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const packBuilderRoot = join(packEditorRoot, '..', 'pack-builder');

export function getPackBuilderRoot(): string {
  return packBuilderRoot;
}

function isPathInside(parent: string, child: string): boolean {
  const normalizedParent = resolve(parent);
  const normalizedChild = resolve(child);
  return (
    normalizedChild === normalizedParent ||
    normalizedChild.startsWith(`${normalizedParent}${sep}`)
  );
}

const packIdPattern = /^[a-z0-9][a-z0-9-]*$/;

export type ResolveSourceDirResult =
  | { ok: true; path: string }
  | { ok: false; status: 403; message: string };

export function resolveSourceDir(packId: string): ResolveSourceDirResult {
  if (!packIdPattern.test(packId) || packId.includes('..')) {
    return { ok: false, status: 403, message: 'invalid packId' };
  }

  const sourceRoot = resolve(packBuilderRoot, 'source');
  const sourceDir = resolve(sourceRoot, packId);

  if (!isPathInside(sourceRoot, sourceDir)) {
    return { ok: false, status: 403, message: 'path escape' };
  }

  if (!existsSync(join(sourceDir, 'meta.json'))) {
    return { ok: false, status: 403, message: 'pack not found' };
  }

  return { ok: true, path: sourceDir };
}

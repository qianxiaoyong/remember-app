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
    normalizedChild === normalizedParent || normalizedChild.startsWith(`${normalizedParent}${sep}`)
  );
}

const allowedAssetPathPattern = /^assets\/[^/]+(?:\/[^/]+)*$/;
const packIdPattern = /^[a-z0-9][a-z0-9-]*$/;

export type ResolveAssetPathResult =
  | { ok: true; absolutePath: string; relativePath: string }
  | { ok: false; status: 403 | 404; message: string };

export function resolvePackAssetPath(
  sourceDir: string,
  relativePath: string,
): ResolveAssetPathResult {
  const normalized = relativePath.replace(/\\/g, '/').trim();
  if (!allowedAssetPathPattern.test(normalized) || normalized.includes('..')) {
    return { ok: false, status: 403, message: 'invalid asset path' };
  }

  const absolutePath = resolve(sourceDir, normalized);
  if (!isPathInside(sourceDir, absolutePath)) {
    return { ok: false, status: 403, message: 'path escape' };
  }

  if (!existsSync(absolutePath)) {
    return { ok: false, status: 404, message: 'asset not found' };
  }

  return { ok: true, absolutePath, relativePath: normalized };
}

const allowedAudioExtensions = ['.mp3', '.wav'] as const;

export function resolvePackAssetWritePath(
  sourceDir: string,
  relativePath: string,
): ResolveAssetPathResult {
  const normalized = relativePath.replace(/\\/g, '/').trim();
  if (!allowedAssetPathPattern.test(normalized) || normalized.includes('..')) {
    return { ok: false, status: 403, message: 'invalid asset path' };
  }

  const lower = normalized.toLowerCase();
  const hasAllowedExtension = allowedAudioExtensions.some((ext) => lower.endsWith(ext));
  if (!hasAllowedExtension) {
    return { ok: false, status: 403, message: 'audio path must end with .mp3 or .wav' };
  }

  const absolutePath = resolve(sourceDir, normalized);
  if (!isPathInside(sourceDir, absolutePath)) {
    return { ok: false, status: 403, message: 'path escape' };
  }

  return { ok: true, absolutePath, relativePath: normalized };
}

export type ResolveSourceDirResult =
  { ok: true; path: string } | { ok: false; status: 403; message: string };

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

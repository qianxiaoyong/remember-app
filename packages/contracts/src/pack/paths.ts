import { PackVerificationError } from './errors.js';

const ROOT_FILES = new Set(['packManifest.json', 'pack.sqlite']);

export function isAllowedPackPath(relativePath: string): boolean {
  if (relativePath.includes('\\')) {
    return false;
  }
  if (relativePath.startsWith('/') || /^[a-zA-Z]:/.test(relativePath)) {
    return false;
  }
  if (relativePath.includes('..')) {
    return false;
  }
  if (ROOT_FILES.has(relativePath)) {
    return true;
  }
  return relativePath.startsWith('assets/');
}

export function assertAllowedPackPath(relativePath: string): void {
  if (!isAllowedPackPath(relativePath)) {
    throw new PackVerificationError('PACK_MANIFEST_INVALID', `illegal pack path: ${relativePath}`);
  }
}

export function normalizeZipEntryPath(entryPath: string): string {
  const normalized = entryPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalized.includes('..')) {
    throw new PackVerificationError(
      'PACK_ARCHIVE_INVALID',
      `path traversal in zip entry: ${entryPath}`,
    );
  }
  return normalized;
}

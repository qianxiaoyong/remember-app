import {
  MAX_PACK_FILE_BYTES,
  MAX_PACK_ZIP_BYTES,
  SUPPORTED_MANIFEST_VERSIONS,
  SUPPORTED_PROTOCOL_VERSIONS,
} from './constants.js';
import { PackVerificationError } from './errors.js';
import type { PackManifest } from './manifest.js';

export function assertSupportedProtocol(manifest: PackManifest): void {
  if (!SUPPORTED_PROTOCOL_VERSIONS.includes(manifest.protocolVersion)) {
    throw new PackVerificationError(
      'PACK_PROTOCOL_UNSUPPORTED',
      `unsupported protocolVersion: ${String(manifest.protocolVersion)}`,
    );
  }

  if (!SUPPORTED_MANIFEST_VERSIONS.includes(manifest.manifestVersion)) {
    throw new PackVerificationError(
      'PACK_MANIFEST_INVALID',
      `unsupported manifestVersion: ${String(manifest.manifestVersion)}`,
    );
  }
}

export function assertArchiveSizeWithinLimit(totalBytes: number): void {
  if (totalBytes > MAX_PACK_ZIP_BYTES) {
    throw new PackVerificationError('PACK_SIZE_EXCEEDED', 'pack archive exceeds size limit');
  }
}

export function assertFileSizeWithinLimit(sizeBytes: number, path: string): void {
  if (sizeBytes > MAX_PACK_FILE_BYTES) {
    throw new PackVerificationError('PACK_SIZE_EXCEEDED', `file exceeds size limit: ${path}`);
  }
}

export interface PackFileContent {
  path: string;
  bytes: Uint8Array;
}

export function verifyManifestFileIntegrity(
  manifest: PackManifest,
  filesByPath: ReadonlyMap<string, Uint8Array>,
  sha256Hex: (bytes: Uint8Array) => string,
): void {
  for (const entry of manifest.files) {
    const bytes = filesByPath.get(entry.path);
    if (!bytes) {
      throw new PackVerificationError(
        'PACK_INTEGRITY_FAILED',
        `missing protected file: ${entry.path}`,
      );
    }

    assertFileSizeWithinLimit(bytes.byteLength, entry.path);

    if (bytes.byteLength !== entry.sizeBytes) {
      throw new PackVerificationError('PACK_INTEGRITY_FAILED', `size mismatch: ${entry.path}`);
    }

    const digest = sha256Hex(bytes);
    if (digest !== entry.sha256) {
      throw new PackVerificationError('PACK_INTEGRITY_FAILED', `hash mismatch: ${entry.path}`);
    }
  }
}

export function readRequiredArchiveFiles(filesByPath: ReadonlyMap<string, Uint8Array>): {
  manifestJson: string;
  sqliteBytes: Uint8Array;
} {
  const manifestBytes = filesByPath.get('packManifest.json');
  const sqliteBytes = filesByPath.get('pack.sqlite');

  if (!manifestBytes) {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'missing packManifest.json');
  }
  if (!sqliteBytes) {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'missing pack.sqlite');
  }

  return {
    manifestJson: new TextDecoder().decode(manifestBytes),
    sqliteBytes,
  };
}

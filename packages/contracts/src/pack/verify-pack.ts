import { packManifestSchema } from './manifest.js';
import { PackVerificationError } from './errors.js';
import type { Ed25519Verifier } from './verify-signature.js';
import { verifyManifestSignature } from './verify-signature.js';
import {
  assertArchiveSizeWithinLimit,
  assertSupportedProtocol,
  readRequiredArchiveFiles,
  verifyManifestFileIntegrity,
} from './verify-integrity.js';
import {
  collectManifestPaths,
  validateLexiconEntries,
  validatePackCards,
} from './verify-content.js';
import type { PackSqliteReader } from './verify-sqlite.js';
import { readPackSqliteContent } from './verify-sqlite.js';

export interface VerifyPackInput {
  filesByPath: ReadonlyMap<string, Uint8Array>;
  totalArchiveBytes: number;
  sha256Hex: (bytes: Uint8Array) => string;
  ed25519: Ed25519Verifier;
  sqliteReader: PackSqliteReader;
}

export async function verifyPackArchive(input: VerifyPackInput): Promise<void> {
  assertArchiveSizeWithinLimit(input.totalArchiveBytes);

  const { manifestJson } = readRequiredArchiveFiles(input.filesByPath);

  let manifest;
  try {
    manifest = packManifestSchema.parse(JSON.parse(manifestJson));
  } catch {
    throw new PackVerificationError(
      'PACK_MANIFEST_INVALID',
      'manifest JSON failed schema validation',
    );
  }

  assertSupportedProtocol(manifest);
  verifyManifestFileIntegrity(manifest, input.filesByPath, input.sha256Hex);
  await verifyManifestSignature(manifest, input.ed25519);

  const { cards, lexiconEntries } = readPackSqliteContent(input.sqliteReader);
  const manifestPaths = collectManifestPaths(manifest);
  validatePackCards(manifest.packId, cards, manifestPaths);
  validateLexiconEntries(lexiconEntries);
}

export type { PackVerificationError };

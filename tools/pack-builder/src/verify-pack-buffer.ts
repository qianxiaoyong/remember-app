import {
  packManifestSchema,
  PackVerificationError,
  verifyPackArchive,
  type PackManifest,
} from '@remember/contracts';
import { ed } from './configure-ed25519.js';
import { sha256Hex } from './sha256.js';
import { createNodeSqliteReader, readZipEntries } from './zip-archive.js';

export interface VerifiedPackArchive {
  manifest: PackManifest;
  sha256: string;
  sizeBytes: number;
  cardCount: number;
  lexiconEntryCount: number;
}

export async function verifyPackZipBuffer(zipBytes: Uint8Array): Promise<VerifiedPackArchive> {
  const filesByPath = readZipEntries(zipBytes);
  const sqliteBytes = filesByPath.get('pack.sqlite');
  if (!sqliteBytes) {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'missing pack.sqlite');
  }

  const manifestBytes = filesByPath.get('packManifest.json');
  if (!manifestBytes) {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'missing packManifest.json');
  }

  const sqliteReader = createNodeSqliteReader(sqliteBytes);
  try {
    await verifyPackArchive({
      filesByPath,
      totalArchiveBytes: zipBytes.byteLength,
      sha256Hex,
      ed25519: ed,
      sqliteReader,
    });
  } catch (error) {
    if (error instanceof PackVerificationError) {
      throw error;
    }
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cannot read pack.sqlite');
  }

  let manifest: PackManifest;
  try {
    manifest = packManifestSchema.parse(JSON.parse(new TextDecoder().decode(manifestBytes)));
  } catch {
    throw new PackVerificationError(
      'PACK_MANIFEST_INVALID',
      'manifest JSON failed schema validation',
    );
  }

  return {
    manifest,
    sha256: sha256Hex(zipBytes),
    sizeBytes: zipBytes.byteLength,
    cardCount: sqliteReader.countRows('cards'),
    lexiconEntryCount: sqliteReader.countRows('lexicon_entries'),
  };
}

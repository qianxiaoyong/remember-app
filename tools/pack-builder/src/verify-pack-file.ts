import { PackVerificationError, verifyPackArchive } from '@remember/contracts';
import { readFileSync } from 'node:fs';
import { ed } from './configure-ed25519.js';
import { sha256Hex } from './sha256.js';
import { createNodeSqliteReader, readZipEntries } from './zip-archive.js';

export async function verifyPackZipFile(zipPath: string): Promise<void> {
  const zipBytes = new Uint8Array(readFileSync(zipPath));
  const filesByPath = readZipEntries(zipBytes);
  const sqliteBytes = filesByPath.get('pack.sqlite');
  if (!sqliteBytes) {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'missing pack.sqlite');
  }

  try {
    await verifyPackArchive({
      filesByPath,
      totalArchiveBytes: zipBytes.byteLength,
      sha256Hex,
      ed25519: ed,
      sqliteReader: createNodeSqliteReader(sqliteBytes),
    });
  } catch (error) {
    if (error instanceof PackVerificationError) {
      throw error;
    }
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cannot read pack.sqlite');
  }
}

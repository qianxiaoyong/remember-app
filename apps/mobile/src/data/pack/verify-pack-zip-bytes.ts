import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { verifyPackArchive } from '@remember/contracts';
import {
  cacheDirectory,
  deleteAsync,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { openDatabaseSync } from 'expo-sqlite';
import { createExpoSqliteReader } from './create-expo-sqlite-reader';
import { bytesToBase64, bytesToHex, readZipEntries } from './read-zip-entries';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (message: Uint8Array) => Promise.resolve(sha512(message));

export interface VerifiedPackSummary {
  packId: string;
  packVersion: string;
  cardCount: number;
  lexiconCount: number;
  lexiconFormCount: number;
}

export async function verifyPackZipBytes(zipBytes: Uint8Array): Promise<VerifiedPackSummary> {
  const filesByPath = readZipEntries(zipBytes);
  const sqliteBytes = filesByPath.get('pack.sqlite');
  if (!sqliteBytes) {
    throw new Error('missing pack.sqlite');
  }

  const manifestBytes = filesByPath.get('packManifest.json');
  if (!manifestBytes) {
    throw new Error('missing packManifest.json');
  }

  const manifest = JSON.parse(new TextDecoder().decode(manifestBytes)) as {
    packId: string;
    packVersion: string;
  };

  const dbPath = `${cacheDirectory ?? ''}remember-pack-verify-${String(Date.now())}.sqlite`;
  await writeAsStringAsync(dbPath, bytesToBase64(sqliteBytes), {
    encoding: EncodingType.Base64,
  });

  const db = openDatabaseSync(dbPath);
  db.execSync('PRAGMA query_only = ON');

  await verifyPackArchive({
    filesByPath,
    totalArchiveBytes: zipBytes.byteLength,
    sha256Hex: (bytes) => bytesToHex(sha256(bytes)),
    ed25519: ed,
    sqliteReader: createExpoSqliteReader(db),
  });

  const cardCount =
    db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM cards')?.count ?? 0;
  const lexiconCount =
    db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM lexicon_entries')?.count ?? 0;
  const lexiconFormCount =
    db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM lexicon_forms')?.count ?? 0;

  let writeRejected = false;
  try {
    db.runSync(
      'INSERT INTO cards (knowledgeId, cardType, sortOrder, content) VALUES (?, ?, ?, ?)',
      ['hack', 'vocabulary', 99, '{}'],
    );
  } catch {
    writeRejected = true;
  }

  db.closeSync();
  await deleteAsync(dbPath, { idempotent: true });

  if (!writeRejected) {
    throw new Error('pack sqlite write was not rejected');
  }

  return {
    packId: manifest.packId,
    packVersion: manifest.packVersion,
    cardCount,
    lexiconCount,
    lexiconFormCount,
  };
}

export { readZipEntries };

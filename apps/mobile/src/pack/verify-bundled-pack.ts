import { Asset } from 'expo-asset';
import * as ed from '@noble/ed25519';
import { sha256 } from '@noble/hashes/sha2.js';
import { sha512 } from '@noble/hashes/sha2.js';
import {
  verifyPackArchive,
  normalizeZipEntryPath,
  type PackSqliteReader,
} from '@remember/contracts';
import {
  cacheDirectory,
  deleteAsync,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import { unzipSync } from 'fflate';
import testPackModule from '../../assets/packs/remember-test-pack.zip';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (message: Uint8Array) => Promise.resolve(sha512(message));

export interface PackReadSummary {
  packId: string;
  cardCount: number;
  lexiconCount: number;
  lexiconFormCount: number;
}

export async function verifyBundledTestPack(): Promise<PackReadSummary> {
  const asset = Asset.fromModule(testPackModule);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error('failed to load bundled test pack');
  }

  const response = await fetch(asset.localUri);
  const buffer = await response.arrayBuffer();
  return verifyPackZipBytes(new Uint8Array(buffer));
}

export async function verifyPackZipBytes(zipBytes: Uint8Array): Promise<PackReadSummary> {
  const filesByPath = readZipEntries(zipBytes);
  const sqliteBytes = filesByPath.get('pack.sqlite');
  if (!sqliteBytes) {
    throw new Error('missing pack.sqlite');
  }

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

  const manifestBytes = filesByPath.get('packManifest.json');
  const manifest = manifestBytes
    ? (JSON.parse(new TextDecoder().decode(manifestBytes)) as { packId: string })
    : { packId: 'unknown' };

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
    cardCount,
    lexiconCount,
    lexiconFormCount,
  };
}

function createExpoSqliteReader(db: SQLiteDatabase): PackSqliteReader {
  return {
    listTables(): string[] {
      return db
        .getAllSync<{ name: string }>(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .map((row) => row.name);
    },
    readTableInfo(tableName: string) {
      return db
        .getAllSync<{ name: string; type: string; notnull: number; pk: number }>(
          `PRAGMA table_info(${tableName})`,
        )
        .map((row) => ({
          name: row.name,
          type: row.type,
          notnull: row.notnull,
          pk: row.pk,
        }));
    },
    countRows(tableName: string): number {
      return (
        db.getFirstSync<{ count: number }>(`SELECT COUNT(*) AS count FROM ${tableName}`)?.count ?? 0
      );
    },
    readAllCards() {
      return db.getAllSync<{
        knowledgeId: string;
        cardType: string;
        sortOrder: number;
        content: string;
      }>('SELECT knowledgeId, cardType, sortOrder, content FROM cards ORDER BY sortOrder');
    },
    readAllLexiconEntries() {
      return db.getAllSync<{
        surfaceForm: string;
        displayForm: string;
        definitions: string;
        ipa: string | null;
        formNote: string | null;
        audioUrl: string | null;
      }>(
        'SELECT surfaceForm, displayForm, definitions, ipa, formNote, audioUrl FROM lexicon_entries ORDER BY surfaceForm',
      );
    },
  };
}

function readZipEntries(zipBytes: Uint8Array): Map<string, Uint8Array> {
  const entries = unzipSync(zipBytes);
  const filesByPath = new Map<string, Uint8Array>();
  for (const [entryPath, bytes] of Object.entries(entries)) {
    if (entryPath.endsWith('/')) {
      continue;
    }
    const normalized = normalizeZipEntryPath(entryPath);
    filesByPath.set(normalized, bytes);
  }
  return filesByPath;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

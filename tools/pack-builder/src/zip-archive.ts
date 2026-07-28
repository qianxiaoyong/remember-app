import { unzipSync, zipSync } from 'fflate';
import { normalizeZipEntryPath, PackVerificationError } from '@remember/contracts';
import type { PackSqliteReader } from '@remember/contracts';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function readZipEntries(zipBytes: Uint8Array): Map<string, Uint8Array> {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(zipBytes);
  } catch {
    throw new PackVerificationError('PACK_ARCHIVE_INVALID', 'zip archive is invalid');
  }

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

export function createNodeSqliteReader(sqliteBytes: Uint8Array): PackSqliteReader {
  const tempDir = mkdtempSync(join(tmpdir(), 'remember-pack-'));
  const dbPath = join(tempDir, 'pack.sqlite');
  writeFileSync(dbPath, sqliteBytes);

  let db: DatabaseSync;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
  } catch {
    rmSync(tempDir, { recursive: true, force: true });
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cannot open pack.sqlite');
  }

  const reader: PackSqliteReader = {
    listTables(): string[] {
      const rows = db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
        .all() as {
        name: string;
      }[];
      return rows.map((row) => row.name);
    },
    readTableInfo(tableName: string) {
      return db.prepare(`PRAGMA table_info(${tableName})`).all() as {
        name: string;
        type: string;
        notnull: number;
        pk: number;
      }[];
    },
    countRows(tableName: string): number {
      const row = db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get() as {
        count: number;
      };
      return row.count;
    },
    readAllCards() {
      return db
        .prepare('SELECT knowledgeId, cardType, sortOrder, content FROM cards ORDER BY sortOrder')
        .all() as {
        knowledgeId: string;
        cardType: string;
        sortOrder: number;
        content: string;
      }[];
    },
    readAllLexiconEntries() {
      return db
        .prepare(
          'SELECT surfaceForm, displayForm, definitions, ipa, formNote, audioUrl FROM lexicon_entries ORDER BY surfaceForm',
        )
        .all() as {
        surfaceForm: string;
        displayForm: string;
        definitions: string;
        ipa: string | null;
        formNote: string | null;
        audioUrl: string | null;
      }[];
    },
  };

  return reader;
}

export function closeNodeSqliteReader(): void {
  // DatabaseSync 在进程退出时释放；verify 为短生命周期命令，依赖 OS 清理 temp 目录。
}

export function writeZip(entries: Record<string, Uint8Array>): Uint8Array {
  return zipSync(entries, { level: 9 });
}

export function readFileBytes(path: string): Uint8Array {
  return new Uint8Array(readFileSync(path));
}

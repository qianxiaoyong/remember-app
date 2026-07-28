import {
  buildKnowledgeId,
  CREATE_PACK_SQLITE_SQL,
  MANIFEST_VERSION,
  normalizeSurfaceForm,
  PROTOCOL_VERSION,
  signManifestPayload,
  tokenizeEnglishSentence,
  type LexiconEntry,
  type VocabularyContent,
} from '@remember/contracts';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { sha256Hex } from './sha256.js';
import { ed } from './configure-ed25519.js';
import { writeZip } from './zip-archive.js';

const TEST_PRIVATE_KEY_HEX = '9d61b19deffd5a60ba844af492ec2cc44401c569d40c893265af344b4352f907';

export interface PackSourceMeta {
  packId: string;
  packVersion: string;
  keyId: string;
}

export interface PackSourceCard {
  kind: 'word' | 'phrase';
  sortOrder: number;
  content: VocabularyContent;
}

export interface PackSource {
  meta: PackSourceMeta;
  cards: PackSourceCard[];
  lexicon: LexiconEntry[];
}

export function readPackSource(sourceDir: string): PackSource {
  const meta = JSON.parse(readFileSync(join(sourceDir, 'meta.json'), 'utf8')) as PackSourceMeta;
  const cards = JSON.parse(readFileSync(join(sourceDir, 'cards.json'), 'utf8')) as PackSourceCard[];
  const lexicon = JSON.parse(
    readFileSync(join(sourceDir, 'lexicon.json'), 'utf8'),
  ) as LexiconEntry[];
  return { meta, cards, lexicon };
}

export function collectAssetFiles(sourceDir: string): Map<string, Uint8Array> {
  const assetsDir = join(sourceDir, 'assets');
  const files = new Map<string, Uint8Array>();

  function walk(currentDir: string): void {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
        continue;
      }
      const relativePath = relative(sourceDir, fullPath).replace(/\\/g, '/');
      files.set(relativePath, new Uint8Array(readFileSync(fullPath)));
    }
  }

  walk(assetsDir);
  return files;
}

function addExampleTokensToLexicon(sentence: string, bySurface: Map<string, LexiconEntry>): void {
  for (const token of tokenizeEnglishSentence(sentence)) {
    const surface = normalizeSurfaceForm(token);
    if (!surface || bySurface.has(surface)) {
      continue;
    }
    bySurface.set(surface, {
      surfaceForm: surface,
      displayForm: token,
      definitions: [{ text: `(auto) ${surface}` }],
    });
  }
}

function buildLexiconFromExamples(
  cards: PackSourceCard[],
  provided: LexiconEntry[],
): LexiconEntry[] {
  const bySurface = new Map<string, LexiconEntry>();
  for (const entry of provided) {
    bySurface.set(entry.surfaceForm, entry);
  }

  for (const card of cards) {
    for (const example of card.content.reveal.examples) {
      addExampleTokensToLexicon(example.en, bySurface);
    }
  }

  return [...bySurface.values()].sort((left, right) =>
    left.surfaceForm.localeCompare(right.surfaceForm),
  );
}

function createSqliteBytes(source: PackSource): Uint8Array {
  const tempPath = join(
    tmpdir(),
    `remember-pack-${String(Date.now())}-${Math.random().toString(16).slice(2)}.sqlite`,
  );
  const db = new DatabaseSync(tempPath);
  db.exec(CREATE_PACK_SQLITE_SQL);

  const insertCard = db.prepare(
    'INSERT INTO cards (knowledgeId, cardType, sortOrder, content) VALUES (?, ?, ?, ?)',
  );
  const insertLexicon = db.prepare(
    'INSERT INTO lexicon_entries (surfaceForm, displayForm, definitions, ipa, formNote, audioUrl) VALUES (?, ?, ?, ?, ?, ?)',
  );

  for (const card of source.cards) {
    const knowledgeId = buildKnowledgeId(
      source.meta.packId,
      card.content.prompt.headword,
      card.kind,
    );
    insertCard.run(knowledgeId, 'vocabulary', card.sortOrder, JSON.stringify(card.content));
  }

  const lexicon = buildLexiconFromExamples(source.cards, source.lexicon);
  for (const entry of lexicon) {
    insertLexicon.run(
      entry.surfaceForm,
      entry.displayForm,
      JSON.stringify(entry.definitions),
      entry.ipa ?? null,
      entry.formNote ?? null,
      entry.audioUrl ?? null,
    );
  }

  db.close();
  const bytes = new Uint8Array(readFileSync(tempPath));
  rmSync(tempPath, { force: true });
  return bytes;
}

export async function buildPackArchive(sourceDir: string): Promise<Record<string, Uint8Array>> {
  const source = readPackSource(sourceDir);
  const assetFiles = collectAssetFiles(sourceDir);
  const sqliteBytes = createSqliteBytes(source);

  const filesByPath = new Map<string, Uint8Array>([
    ['pack.sqlite', sqliteBytes],
    ...assetFiles.entries(),
  ]);

  const manifestFiles = [...filesByPath.entries()]
    .map(([path, bytes]) => ({
      path,
      sha256: sha256Hex(bytes),
      sizeBytes: bytes.byteLength,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const manifestWithoutSignature = {
    manifestVersion: MANIFEST_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    packId: source.meta.packId,
    packVersion: source.meta.packVersion,
    keyId: source.meta.keyId,
    files: manifestFiles,
  };

  const privateKeyHex = process.env.REMEMBER_PACK_SIGNING_PRIVATE_KEY_HEX ?? TEST_PRIVATE_KEY_HEX;
  const signature = await signManifestPayload(
    manifestWithoutSignature,
    privateKeyHex,
    (message, privateKey) => ed.sign(message, privateKey),
  );

  const manifest = {
    ...manifestWithoutSignature,
    signature,
  };

  const manifestBytes = new TextEncoder().encode(`${JSON.stringify(manifest, null, 2)}\n`);
  filesByPath.set('packManifest.json', manifestBytes);

  const archiveEntries: Record<string, Uint8Array> = {};
  for (const [path, bytes] of filesByPath.entries()) {
    archiveEntries[path] = bytes;
  }

  return archiveEntries;
}

export function writeBuiltPack(outputPath: string, entries: Record<string, Uint8Array>): void {
  const zipBytes = writeZip(entries);
  mkdirSync(join(outputPath, '..'), { recursive: true });
  writeFileSync(outputPath, zipBytes);
}

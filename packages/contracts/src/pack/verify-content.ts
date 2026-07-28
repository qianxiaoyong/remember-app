import { PackVerificationError } from './errors.js';
import { CARD_TYPE_VOCABULARY } from './constants.js';
import { packCardRowSchema, parseCardContentJson } from './card.js';
import { isValidKnowledgeIdFormat, knowledgeIdMatchesHeadword } from './knowledge-id.js';
import { parseLexiconDefinitionsJson } from './lexicon.js';
import type { PackManifest } from './manifest.js';
import { assertAllowedPackPath } from './paths.js';
import { normalizeSurfaceForm } from './normalize.js';
import type { PackCardRow } from './card.js';
import type { LexiconEntry } from './lexicon.js';

export interface PackCardRecord {
  knowledgeId: string;
  cardType: string;
  sortOrder: number;
  content: string;
}

export interface PackLexiconRecord {
  surfaceForm: string;
  displayForm: string;
  definitions: string;
  ipa: string | null;
  formNote: string | null;
  audioUrl: string | null;
}

export function validatePackCards(
  packId: string,
  cards: PackCardRecord[],
  manifestPaths: ReadonlySet<string>,
): PackCardRow[] {
  if (cards.length === 0) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'cards table is empty');
  }

  const knowledgeIds = new Set<string>();
  const sortOrders = new Set<number>();
  const validated: PackCardRow[] = [];

  for (const card of cards) {
    if (!isValidKnowledgeIdFormat(card.knowledgeId)) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `invalid knowledgeId: ${card.knowledgeId}`,
      );
    }

    if (knowledgeIds.has(card.knowledgeId)) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `duplicate knowledgeId: ${card.knowledgeId}`,
      );
    }
    knowledgeIds.add(card.knowledgeId);

    if (sortOrders.has(card.sortOrder)) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `duplicate sortOrder: ${String(card.sortOrder)}`,
      );
    }
    sortOrders.add(card.sortOrder);

    if (card.cardType !== CARD_TYPE_VOCABULARY) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `unsupported cardType: ${card.knowledgeId}`,
      );
    }

    let content: ReturnType<typeof parseCardContentJson>;
    try {
      content = parseCardContentJson(card.content);
    } catch {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `invalid card content: ${card.knowledgeId}`,
      );
    }

    const kind = card.knowledgeId.includes(':en:phrase:') ? 'phrase' : 'word';
    if (!knowledgeIdMatchesHeadword({
      knowledgeId: card.knowledgeId,
      packId,
      headword: content.prompt.headword,
      kind,
    })) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `knowledgeId does not match headword: ${card.knowledgeId}`,
      );
    }

    assertAssetReferenced(manifestPaths, content.prompt.primaryAudio, card.knowledgeId);
    if (content.prompt.primaryImage) {
      assertAssetReferenced(manifestPaths, content.prompt.primaryImage, card.knowledgeId);
    }

    for (const example of content.reveal.examples) {
      if (example.audio) {
        assertAssetReferenced(manifestPaths, example.audio, card.knowledgeId);
      }
    }

    validated.push(
      packCardRowSchema.parse({
        knowledgeId: card.knowledgeId,
        cardType: card.cardType,
        sortOrder: card.sortOrder,
        content,
      }),
    );
  }

  return validated;
}

export function validateLexiconEntries(records: PackLexiconRecord[]): LexiconEntry[] {
  if (records.length === 0) {
    throw new PackVerificationError('PACK_SCHEMA_INVALID', 'lexicon_entries table is empty');
  }

  const validated: LexiconEntry[] = [];
  for (const record of records) {
    const normalizedSurface = normalizeSurfaceForm(record.surfaceForm);
    if (normalizedSurface === null || normalizedSurface !== record.surfaceForm) {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `invalid lexicon surfaceForm: ${record.surfaceForm}`,
      );
    }

    let definitions: ReturnType<typeof parseLexiconDefinitionsJson>;
    try {
      definitions = parseLexiconDefinitionsJson(record.definitions);
    } catch {
      throw new PackVerificationError(
        'PACK_CONTENT_INVALID',
        `invalid lexicon definitions: ${record.surfaceForm}`,
      );
    }

    const entry: LexiconEntry = {
      surfaceForm: record.surfaceForm,
      displayForm: record.displayForm,
      definitions,
    };

    if (record.ipa) {
      entry.ipa = record.ipa;
    }
    if (record.formNote) {
      entry.formNote = record.formNote;
    }
    if (record.audioUrl) {
      entry.audioUrl = record.audioUrl;
    }

    validated.push(entry);
  }

  return validated;
}

function assertAssetReferenced(
  manifestPaths: ReadonlySet<string>,
  assetPath: string,
  context: string,
): void {
  try {
    assertAllowedPackPath(assetPath);
  } catch {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `illegal asset path on ${context}: ${assetPath}`,
    );
  }

  if (!manifestPaths.has(assetPath)) {
    throw new PackVerificationError(
      'PACK_CONTENT_INVALID',
      `asset not listed in manifest: ${assetPath} (${context})`,
    );
  }
}

export function collectManifestPaths(manifest: PackManifest): Set<string> {
  return new Set(manifest.files.map((file) => file.path));
}

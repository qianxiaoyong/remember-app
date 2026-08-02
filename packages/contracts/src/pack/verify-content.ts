import { PackVerificationError } from './errors.js';
import { CARD_TYPE_VOCABULARY } from './constants.js';
import { isSupportedCardType } from './card-type-registry.js';
import { parseLexiconDefinitionsJson } from './lexicon.js';
import type { PackManifest } from './manifest.js';
import { normalizeSurfaceForm } from './normalize.js';
import type { PackCardRow } from './card.js';
import type { LexiconEntry } from './lexicon.js';
import { validateVocabularyCard } from './validate-vocabulary-card.js';
import { isValidKnowledgeIdFormat } from './knowledge-id.js';

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

    if (!isSupportedCardType(card.cardType)) {
      throw new PackVerificationError(
        'PACK_UNSUPPORTED_CARD_TYPE',
        `unsupported cardType: ${card.cardType}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- cardType 分发预留多 type 分支
    if (card.cardType === CARD_TYPE_VOCABULARY) {
      validated.push(validateVocabularyCard(packId, card, manifestPaths));
    }
  }

  if (validated.length !== cards.length) {
    throw new PackVerificationError(
      'PACK_SCHEMA_INVALID',
      `validated card count mismatch: expected ${String(cards.length)}, got ${String(validated.length)}`,
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

export function collectManifestPaths(manifest: PackManifest): Set<string> {
  return new Set(manifest.files.map((file) => file.path));
}

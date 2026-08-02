import { PackVerificationError } from './errors.js';
import { CARD_TYPE_VOCABULARY } from './constants.js';
import { vocabularyPackCardRowSchema, parseCardContentJson } from './card.js';
import { knowledgeIdMatchesHeadword } from './knowledge-id.js';
import { assertAllowedPackPath } from './paths.js';
import type { PackCardRow } from './card.js';
import type { PackCardRecord } from './verify-content.js';

export function validateVocabularyCard(
  packId: string,
  card: PackCardRecord,
  manifestPaths: ReadonlySet<string>,
): PackCardRow {
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
  if (
    !knowledgeIdMatchesHeadword({
      knowledgeId: card.knowledgeId,
      packId,
      headword: content.prompt.headword,
      kind,
    })
  ) {
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

  return vocabularyPackCardRowSchema.parse({
    knowledgeId: card.knowledgeId,
    cardType: CARD_TYPE_VOCABULARY,
    sortOrder: card.sortOrder,
    content,
  });
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

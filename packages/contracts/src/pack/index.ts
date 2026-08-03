export { packErrorCodes, PackVerificationError, type PackErrorCode } from './errors.js';
export {
  CARD_TYPE_STORY_READING,
  CARD_TYPE_VOCABULARY,
  MANIFEST_VERSION,
  MAX_PACK_FILE_BYTES,
  MAX_PACK_ZIP_BYTES,
  PROTOCOL_VERSION,
  SUPPORTED_CARD_TYPES,
  SUPPORTED_MANIFEST_VERSIONS,
  SUPPORTED_PROTOCOL_VERSIONS,
  TEST_PACK_KEY_ID,
  TEST_PACK_PUBLIC_KEY_HEX,
} from './constants.js';
export { canonicalJson, manifestBytesForSigning } from './canonical-json.js';
export {
  buildKnowledgeId,
  buildStoryKnowledgeId,
  isValidKnowledgeIdFormat,
  knowledgeIdMatchesHeadword,
  knowledgeIdMatchesLessonCode,
  slugFromHeadword,
  slugFromLessonCode,
} from './knowledge-id.js';
export { normalizeSurfaceForm, tokenizeEnglishSentence } from './normalize.js';
export { assertAllowedPackPath, isAllowedPackPath, normalizeZipEntryPath } from './paths.js';
export {
  packManifestFileSchema,
  packManifestSchema,
  packManifestSectionSchema,
  packManifestForSigningSchema,
  type PackManifest,
  type PackManifestFile,
  type PackManifestForSigning,
} from './manifest.js';
export {
  vocabularyContentSchema,
  vocabularyDefinitionSchema,
  vocabularyExampleSchema,
  vocabularyMnemonicSchema,
  vocabularyPhoneticSchema,
  vocabularyPromptSchema,
  vocabularyRevealSchema,
  type VocabularyContent,
} from './vocabulary-content.js';
export {
  storyReadingContentSchema,
  storyRunSchema,
  storySidebarEntrySchema,
  storyTierSchema,
  STORY_LEGEND_TIERS,
  STORY_TIER_OPTIONS,
  parseStoryReadingContentJson,
  type StoryLegendTier,
  type StoryReadingContent,
  type StoryParagraph,
  type StoryRun,
  type StorySidebarEntry,
  type StoryTextRun,
  type StoryTier,
  type StoryWordRun,
} from './story-reading-content.js';
export {
  packCardRowSchema,
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- ADR 0012 保留 vocabulary 别名
  parseCardContentJson,
  type PackCardRow,
} from './card.js';
export {
  isSupportedCardType,
  parsePackCardContent,
  type CardType,
  type ParsedPackCardContent,
} from './card-type-registry.js';
export { lexiconEntrySchema, parseLexiconDefinitionsJson, type LexiconEntry } from './lexicon.js';
export {
  CREATE_PACK_SQLITE_SQL,
  PACK_CARDS_COLUMNS,
  PACK_LEXICON_ENTRIES_COLUMNS,
  PACK_LEXICON_FORMS_COLUMNS,
  PACK_SQLITE_TABLES,
  columnsMatchExpected,
  type SqliteColumnInfo,
} from './sqlite-schema.js';
export {
  PACK_TRUSTED_PUBLIC_KEYS,
  getTrustedPublicKeyHex,
  base64ToBytes,
  hexToBytes,
  type TrustedPublicKey,
} from './trusted-keys.js';
export {
  assertArchiveSizeWithinLimit,
  assertFileSizeWithinLimit,
  assertSupportedProtocol,
  readRequiredArchiveFiles,
  verifyManifestFileIntegrity,
  type PackFileContent,
} from './verify-integrity.js';
export {
  verifyManifestSignature,
  signManifestPayload,
  bytesToBase64,
  type Ed25519Verifier,
} from './verify-signature.js';
export {
  validateStoryReadingCard,
  type StoryPackCardRow,
  type StoryReadingValidateContext,
} from './validate-story-reading-card.js';
export {
  validateLexiconEntries,
  validatePackCards,
  collectManifestPaths,
  type PackCardRecord,
  type PackLexiconRecord,
} from './verify-content.js';
export {
  verifyPackSqliteStructure,
  readPackSqliteContent,
  type PackSqliteReader,
} from './verify-sqlite.js';
export { verifyPackArchive, type VerifyPackInput } from './verify-pack.js';

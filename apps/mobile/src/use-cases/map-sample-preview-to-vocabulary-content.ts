import type { VocabularyContent } from '@remember/contracts';
import { vocabularyContentSchema } from '@remember/contracts';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';

/** 将目录 samplePreviews 映射为学习页 vocabulary 展示结构（仅预览，非 pack.sqlite 真值）。 */
export function mapSamplePreviewToVocabularyContent(sample: PackSamplePreview): VocabularyContent {
  return vocabularyContentSchema.parse({
    prompt: {
      headword: sample.headword,
      primaryAudio: 'preview/primary-audio',
      ...(sample.phoneticIpa
        ? {
            phonetic: {
              ipa: sample.phoneticIpa,
              ...(sample.phoneticDialect ? { dialect: sample.phoneticDialect } : {}),
            },
          }
        : {}),
    },
    reveal: {
      definitions: [{ text: sample.zh }],
      examples: [{ en: sample.exampleEn, zh: sample.zh }],
    },
  });
}

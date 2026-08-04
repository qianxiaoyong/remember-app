import {
  definitionEnContentSchema,
  definitionZhContentSchema,
  exampleContentSchema,
  fragmentTypeSchema,
  mnemonicContentSchema,
  morphologyContentSchema,
  noteContentSchema,
  type FragmentType,
} from '@remember/contracts';

const CONTENT_SCHEMA_BY_TYPE = {
  definition_zh: definitionZhContentSchema,
  definition_en: definitionEnContentSchema,
  example: exampleContentSchema,
  mnemonic: mnemonicContentSchema,
  morphology: morphologyContentSchema,
  note: noteContentSchema,
} as const;

export function parseFragmentType(value: string): FragmentType {
  return fragmentTypeSchema.parse(value);
}

export function validateFragmentContent(fragmentType: FragmentType, content: unknown): unknown {
  const schema = CONTENT_SCHEMA_BY_TYPE[fragmentType];
  return schema.parse(content);
}

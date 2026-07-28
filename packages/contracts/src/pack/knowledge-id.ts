const SLUG_PATTERN = /^[a-z0-9-]+$/;
const KNOWLEDGE_ID_PATTERN = /^[^:]+:en:(word|phrase):[a-z0-9-]+$/;

export function slugFromHeadword(headword: string): string {
  return headword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildKnowledgeId(
  packId: string,
  headword: string,
  kind: 'word' | 'phrase',
): string {
  const slug = slugFromHeadword(headword);
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new Error(`invalid headword slug: ${headword}`);
  }
  return `${packId}:en:${kind}:${slug}`;
}

export function isValidKnowledgeIdFormat(knowledgeId: string): boolean {
  return KNOWLEDGE_ID_PATTERN.test(knowledgeId);
}

export function knowledgeIdMatchesHeadword(input: {
  knowledgeId: string;
  packId: string;
  headword: string;
  kind: 'word' | 'phrase';
}): boolean {
  return input.knowledgeId === buildKnowledgeId(input.packId, input.headword, input.kind);
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const VOCABULARY_KNOWLEDGE_ID_PATTERN = /^[^:]+:en:(word|phrase):[a-z0-9-]+$/;
const STORY_KNOWLEDGE_ID_PATTERN = /^[^:]+:story:[a-z0-9-]+$/;

export function slugFromHeadword(headword: string): string {
  return headword
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function slugFromLessonCode(lessonCode: string): string {
  return slugFromHeadword(lessonCode);
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

export function buildStoryKnowledgeId(packId: string, lessonCode: string): string {
  const slug = slugFromLessonCode(lessonCode);
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new Error(`invalid lesson code slug: ${lessonCode}`);
  }
  return `${packId}:story:${slug}`;
}

export function isValidKnowledgeIdFormat(knowledgeId: string): boolean {
  return (
    VOCABULARY_KNOWLEDGE_ID_PATTERN.test(knowledgeId) ||
    STORY_KNOWLEDGE_ID_PATTERN.test(knowledgeId)
  );
}

export function knowledgeIdMatchesHeadword(input: {
  knowledgeId: string;
  packId: string;
  headword: string;
  kind: 'word' | 'phrase';
}): boolean {
  return input.knowledgeId === buildKnowledgeId(input.packId, input.headword, input.kind);
}

export function knowledgeIdMatchesLessonCode(input: {
  knowledgeId: string;
  packId: string;
  lessonCode: string;
}): boolean {
  return input.knowledgeId === buildStoryKnowledgeId(input.packId, input.lessonCode);
}

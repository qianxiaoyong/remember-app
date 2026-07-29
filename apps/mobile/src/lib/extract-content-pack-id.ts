export function extractContentPackIdFromKnowledgeId(knowledgeId: string): string | null {
  const colonIndex = knowledgeId.indexOf(':');
  if (colonIndex <= 0) {
    return null;
  }
  return knowledgeId.slice(0, colonIndex);
}

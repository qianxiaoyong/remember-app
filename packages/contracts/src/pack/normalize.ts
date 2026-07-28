const TOKEN_PATTERN = /^[a-zA-Z']+$/;

export function normalizeSurfaceForm(token: string): string | null {
  const trimmed = token.replace(/^[^a-zA-Z']+|[^a-zA-Z']+$/g, '');
  if (!trimmed || !TOKEN_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed.toLowerCase();
}

export function tokenizeEnglishSentence(sentence: string): string[] {
  const matches = sentence.match(/[a-zA-Z']+/g);
  return matches ?? [];
}

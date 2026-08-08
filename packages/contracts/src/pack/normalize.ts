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

/** 例句标红：headword 拆词后的 surfaceForm 集合（短语含多个 token）。 */
export function headwordEmphasisSurfaceForms(headword: string): string[] {
  const forms = new Set<string>();
  for (const token of tokenizeEnglishSentence(headword)) {
    const normalized = normalizeSurfaceForm(token);
    if (normalized) {
      forms.add(normalized);
    }
  }
  return [...forms];
}

export function sentenceContainsHeadwordEmphasis(
  sentence: string,
  emphasisForms: readonly string[],
): boolean {
  if (emphasisForms.length === 0) {
    return false;
  }
  const formSet = new Set(emphasisForms);
  for (const token of tokenizeEnglishSentence(sentence)) {
    const normalized = normalizeSurfaceForm(token);
    if (normalized && formSet.has(normalized)) {
      return true;
    }
  }
  return false;
}

const LEMMA_KEY_PATTERN = /^[a-z0-9'-]+$/;

export function normalizeLemmaKey(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || !LEMMA_KEY_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function normalizeFormKey(input: string): string | null {
  return normalizeLemmaKey(input);
}

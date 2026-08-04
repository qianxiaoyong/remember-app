export const ECDICT_TAG_LABELS: Record<string, string> = {
  zk: '中考',
  gk: '高考',
  cet4: '大学四级',
  cet6: '大学六级',
  ky: '考研',
  toefl: '托福',
  ielts: '雅思',
  gre: 'GRE',
};

export function parseEcdictTagKeys(tagField: string): string[] {
  if (!tagField.trim()) {
    return [];
  }
  const unique = new Set<string>();
  for (const token of tagField.trim().split(/\s+/)) {
    const tagKey = token.trim().toLowerCase();
    if (tagKey) {
      unique.add(tagKey);
    }
  }
  return [...unique];
}

export function labelForEcdictTag(tagKey: string): string {
  return ECDICT_TAG_LABELS[tagKey] ?? tagKey;
}

export function parsePrimaryPos(posField: string): string | undefined {
  const trimmed = posField.trim();
  if (!trimmed) {
    return undefined;
  }
  const firstSegment = trimmed.split('/')[0]?.trim();
  if (!firstSegment) {
    return undefined;
  }
  const match = /^([a-z]+)/i.exec(firstSegment);
  if (!match?.[1]) {
    return firstSegment;
  }
  return `${match[1]}.`;
}

export function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseCollinsStar(value: string): number | undefined {
  const parsed = parseOptionalInt(value);
  if (parsed === undefined || parsed < 0 || parsed > 5) {
    return undefined;
  }
  return parsed;
}

export function parseOxfordCore(value: string): boolean | undefined {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed === '1' || trimmed === 'true' || trimmed === 'yes') {
    return true;
  }
  if (trimmed === '0' || trimmed === 'false' || trimmed === 'no') {
    return false;
  }
  return undefined;
}

export function normalizeIpa(phonetic: string): string | undefined {
  const trimmed = phonetic.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

export function parseMultilineTextLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function parseTranslationLines(text: string): { text: string; pos?: string }[] {
  return parseMultilineTextLines(text).map((line) => {
    const match = /^([a-z]+\.)\s*(.+)$/i.exec(line);
    if (match?.[1] && match[2]) {
      return { pos: match[1], text: match[2].trim() };
    }
    return { text: line };
  });
}

export function parseDefinitionEnLines(text: string): { text: string }[] {
  return parseMultilineTextLines(text).map((line) => ({ text: line }));
}

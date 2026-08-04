export type EcdictLemmaFormType =
  'past' | 'plural' | 'gerund' | 'third_person' | 'comparative' | 'superlative' | 'other';

export interface ParsedExchangeForm {
  formType: EcdictLemmaFormType;
  displayForm: string;
}

const EXCHANGE_TYPE_MAP: Record<string, EcdictLemmaFormType> = {
  p: 'past',
  d: 'past',
  i: 'gerund',
  '3': 'third_person',
  r: 'comparative',
  t: 'superlative',
  s: 'plural',
};

export function parseExchangeField(exchange: string): ParsedExchangeForm[] {
  if (!exchange.trim()) {
    return [];
  }

  const results: ParsedExchangeForm[] = [];
  for (const part of exchange.split('/')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) {
      continue;
    }
    const typeCode = trimmed.slice(0, colonIndex);
    const displayForm = trimmed.slice(colonIndex + 1).trim();
    if (!displayForm || typeCode === '0' || typeCode === '1') {
      continue;
    }
    results.push({
      formType: EXCHANGE_TYPE_MAP[typeCode] ?? 'other',
      displayForm,
    });
  }
  return results;
}

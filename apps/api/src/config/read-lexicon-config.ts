export interface LexiconConfig {
  enrichMockEnabled: boolean;
  enrichMaxConcurrent: number;
  enrichApiUrl: string | null;
  enrichApiKey: string | null;
}

function readOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return value;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) {
    return fallback;
  }
  if (raw === 'true' || raw === '1') {
    return true;
  }
  if (raw === 'false' || raw === '0') {
    return false;
  }
  throw new Error(`${name} must be true or false`);
}

export function readLexiconConfig(): LexiconConfig {
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const enrichMockDefault = nodeEnv !== 'production';

  const enrichApiUrl = readOptionalEnv('LEXICON_ENRICH_API_URL');
  const enrichApiKey = readOptionalEnv('LEXICON_ENRICH_API_KEY');

  return {
    enrichMockEnabled: readBoolean('LEXICON_ENRICH_MOCK_ENABLED', enrichMockDefault),
    enrichMaxConcurrent: readPositiveInt('LEXICON_ENRICH_MAX_CONCURRENT', 5),
    enrichApiUrl,
    enrichApiKey,
  };
}

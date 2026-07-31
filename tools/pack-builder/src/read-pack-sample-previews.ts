import { vocabularyContentSchema } from '@remember/contracts';
import { createNodeSqliteReader, readZipEntries } from './zip-archive.js';

export interface PackSamplePreviewDraft {
  headword: string;
  zh: string;
  exampleEn: string;
  initial?: string;
}

export function readSamplePreviewsFromZip(
  zipBytes: Uint8Array,
  limit = 2,
): PackSamplePreviewDraft[] {
  const sqliteBytes = readZipEntries(zipBytes).get('pack.sqlite');
  if (!sqliteBytes) {
    return [];
  }

  const reader = createNodeSqliteReader(sqliteBytes);
  const previews: PackSamplePreviewDraft[] = [];
  for (const row of reader.readAllCards()) {
    if (previews.length >= limit) {
      break;
    }
    let content: unknown;
    try {
      content = JSON.parse(row.content);
    } catch {
      continue;
    }
    const parsed = vocabularyContentSchema.safeParse(content);
    if (!parsed.success) {
      continue;
    }
    const headword = parsed.data.prompt.headword.trim();
    const zh = parsed.data.reveal.definitions[0]?.text.trim();
    const exampleEn = parsed.data.reveal.examples[0]?.en.trim();
    if (!headword || !zh || !exampleEn) {
      continue;
    }
    previews.push({
      headword,
      zh,
      exampleEn,
      initial: headword.charAt(0).toUpperCase(),
    });
  }
  return previews;
}

export function formatPackSizeLabel(sizeBytes: number): string {
  if (sizeBytes < 1024) {
    return `${String(sizeBytes)} B`;
  }
  if (sizeBytes < 1024 * 1024) {
    return `约 ${Math.round(sizeBytes / 1024)} KB`;
  }
  return `约 ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

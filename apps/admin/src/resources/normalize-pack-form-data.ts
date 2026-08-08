import type { IntroMediaItem } from '@remember/contracts';

function readTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Admin 表单提交前：丢弃空 URL、按行序写入 sortOrder。 */
export function normalizeIntroMediaForSubmit(value: unknown): IntroMediaItem[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items: IntroMediaItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') {
      continue;
    }
    const row = raw as Record<string, unknown>;
    const url = readTrimmedString(row.url);
    if (!url) {
      continue;
    }
    const posterUrl = readTrimmedString(row.posterUrl);
    items.push({
      type: row.type === 'video' ? 'video' : 'image',
      url,
      sortOrder: items.length,
      ...(posterUrl ? { posterUrl } : {}),
    });
  }

  return items;
}

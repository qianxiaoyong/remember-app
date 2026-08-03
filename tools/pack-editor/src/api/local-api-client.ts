import type { PackSource, PackSourceCard } from '@remember/pack-builder/pack-source';

export interface PackSummary {
  packId: string;
  packVersion: string;
  cardCount: number;
}

export interface ValidationIssue {
  sortOrder?: number;
  path: string;
  message: string;
}

export interface ValidateResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export interface BuildResult {
  ok: boolean;
  outputPath?: string;
  log?: string;
  error?: string;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `请求失败 (${String(response.status)})`);
  }
  return response.json() as Promise<T>;
}

export async function listPacks(): Promise<PackSummary[]> {
  const data = await readJson<{ items: PackSummary[] }>(await fetch('/local-api/packs'));
  return data.items;
}

export async function loadPackSource(packId: string): Promise<PackSource> {
  return readJson<PackSource>(await fetch(`/local-api/packs/${encodeURIComponent(packId)}/source`));
}

export async function saveCard(packId: string, card: PackSourceCard): Promise<void> {
  await readJson<{ ok: true }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/cards/${String(card.sortOrder)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    }),
  );
}

export async function createCard(
  packId: string,
  kind: 'word' | 'phrase' = 'word',
): Promise<PackSourceCard> {
  const data = await readJson<{ card: PackSourceCard }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind }),
    }),
  );
  return data.card;
}

export async function createStoryCard(
  packId: string,
  lessonCode?: string,
): Promise<PackSourceCard> {
  const data = await readJson<{ card: PackSourceCard }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardType: 'story_reading',
        ...(lessonCode ? { lessonCode } : {}),
      }),
    }),
  );
  return data.card;
}

export async function deleteCard(packId: string, sortOrder: number): Promise<void> {
  await readJson<{ ok: true }>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/cards/${String(sortOrder)}`, {
      method: 'DELETE',
    }),
  );
}

export async function validatePack(packId: string): Promise<ValidateResult> {
  return readJson<ValidateResult>(
    await fetch(`/local-api/packs/${encodeURIComponent(packId)}/validate`, { method: 'POST' }),
  );
}

export async function buildPack(packId: string, packVersion?: string): Promise<BuildResult> {
  const response = await fetch(`/local-api/packs/${encodeURIComponent(packId)}/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packVersion ? { packVersion } : {}),
  });
  const data = (await response.json()) as BuildResult;
  if (!response.ok) {
    return { ok: false, error: data.error ?? `请求失败 (${String(response.status)})` };
  }
  return data;
}

export function suggestNextPatchVersion(version: string): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return version;
  }
  const major = match[1] ?? '0';
  const minor = match[2] ?? '0';
  const patch = match[3] ?? '0';
  return `${major}.${minor}.${String(Number(patch) + 1)}`;
}

export function packAssetUrl(packId: string, relativePath: string): string {
  return `/local-api/packs/${encodeURIComponent(packId)}/assets/${relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')}`;
}

export async function fetchAudioDurationMs(packId: string, relativePath: string): Promise<number> {
  const data = await readJson<{ durationMs: number }>(
    await fetch(
      `/local-api/packs/${encodeURIComponent(packId)}/audio-meta?path=${encodeURIComponent(relativePath)}`,
    ),
  );
  return data.durationMs;
}

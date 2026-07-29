import { documentDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';

const FILE_NAME = 'mock-purchased-pack-ids.json';

let cachedIds: Set<string> | null = null;

async function readIds(): Promise<Set<string>> {
  if (cachedIds) {
    return cachedIds;
  }
  const path = `${documentDirectory ?? ''}${FILE_NAME}`;
  try {
    const raw = await readAsStringAsync(path);
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      cachedIds = new Set();
      return cachedIds;
    }
    cachedIds = new Set(parsed.filter((item): item is string => typeof item === 'string'));
    return cachedIds;
  } catch {
    cachedIds = new Set();
    return cachedIds;
  }
}

async function writeIds(ids: Set<string>): Promise<void> {
  cachedIds = ids;
  const path = `${documentDirectory ?? ''}${FILE_NAME}`;
  await writeAsStringAsync(path, JSON.stringify([...ids]));
}

export async function isPackMockPurchased(packId: string): Promise<boolean> {
  const ids = await readIds();
  return ids.has(packId);
}

export async function markPackMockPurchased(packId: string): Promise<void> {
  const ids = await readIds();
  ids.add(packId);
  await writeIds(ids);
}

export function resetMockPurchaseCacheForTests(): void {
  cachedIds = null;
}

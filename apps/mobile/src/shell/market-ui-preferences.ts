import { documentDirectory, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';

const FILE_NAME = 'market-ui-preferences.json';

interface MarketUiPreferences {
  sidebarCollapsed: boolean;
}

const DEFAULT_PREFERENCES: MarketUiPreferences = {
  sidebarCollapsed: true,
};

let cachedPreferences: MarketUiPreferences | null = null;

function normalizePreferences(value: unknown): MarketUiPreferences {
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_PREFERENCES;
  }

  const record = value as Record<string, unknown>;
  return {
    sidebarCollapsed:
      typeof record.sidebarCollapsed === 'boolean'
        ? record.sidebarCollapsed
        : DEFAULT_PREFERENCES.sidebarCollapsed,
  };
}

export function getMarketSidebarCollapsedSync(): boolean {
  return cachedPreferences?.sidebarCollapsed ?? DEFAULT_PREFERENCES.sidebarCollapsed;
}

export async function readMarketUiPreferences(): Promise<MarketUiPreferences> {
  if (cachedPreferences) {
    return cachedPreferences;
  }

  const path = `${documentDirectory ?? ''}${FILE_NAME}`;
  try {
    const raw = await readAsStringAsync(path);
    cachedPreferences = normalizePreferences(JSON.parse(raw) as unknown);
    return cachedPreferences;
  } catch {
    cachedPreferences = DEFAULT_PREFERENCES;
    return cachedPreferences;
  }
}

export async function writeMarketSidebarCollapsed(collapsed: boolean): Promise<void> {
  cachedPreferences = {
    ...(cachedPreferences ?? DEFAULT_PREFERENCES),
    sidebarCollapsed: collapsed,
  };
  const path = `${documentDirectory ?? ''}${FILE_NAME}`;
  await writeAsStringAsync(path, JSON.stringify(cachedPreferences));
}

export function resetMarketUiPreferencesCacheForTests(): void {
  cachedPreferences = null;
}

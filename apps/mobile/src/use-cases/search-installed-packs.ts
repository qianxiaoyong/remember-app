import {
  listInstalledPackSummaries,
  type InstalledPackSummary,
} from './get-library-overview';

export function searchInstalledPackSummaries(keyword: string): InstalledPackSummary[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return listInstalledPackSummaries().filter((pack) =>
    pack.displayName.toLowerCase().includes(normalized),
  );
}

import type { SQLiteDatabase } from 'expo-sqlite';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import {
  listInstalledPacks,
  upsertInstalledPack,
} from '../data/repositories/installed-pack-repository';

export function syncInstalledPackDisplayNamesFromCatalog(
  catalog: CatalogPackItem[],
  db?: SQLiteDatabase,
): number {
  const titleByPackId = new Map(catalog.map((item) => [item.packId, item.title]));
  let updatedCount = 0;

  for (const pack of listInstalledPacks(db)) {
    const title = titleByPackId.get(pack.packId);
    if (!title || pack.displayName === title) {
      continue;
    }
    upsertInstalledPack({ ...pack, displayName: title }, db);
    updatedCount += 1;
  }

  return updatedCount;
}

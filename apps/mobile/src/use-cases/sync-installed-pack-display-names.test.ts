import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import type { InstalledPackRow } from '../data/repositories/installed-pack-repository';

const listInstalledPacks = vi.fn<() => InstalledPackRow[]>();
const upsertInstalledPack = vi.fn<(row: InstalledPackRow, db?: unknown) => InstalledPackRow>();

vi.mock('../data/repositories/installed-pack-repository', () => ({
  listInstalledPacks: (): InstalledPackRow[] => listInstalledPacks(),
  upsertInstalledPack: (row: InstalledPackRow, db?: unknown): InstalledPackRow =>
    upsertInstalledPack(row, db),
}));

import { syncInstalledPackDisplayNamesFromCatalog } from './sync-installed-pack-display-names';

const catalogItem: CatalogPackItem = {
  packId: 'en-grade3-v1-rj',
  title: '三年级上册人教版单词表',
  primaryCategory: 'primary',
  secondaryCategory: '三年级',
  version: '人教版',
  contentTags: [],
  cardCount: 112,
  sizeLabel: '约 3 MB',
  updatedAt: '2026-07-31',
  priceCents: 100,
  priceLabel: '¥1',
  summary: '',
  sampleHeadwords: [],
  isBundledTestPack: false,
};

describe('syncInstalledPackDisplayNamesFromCatalog', () => {
  beforeEach(() => {
    listInstalledPacks.mockReset();
    upsertInstalledPack.mockReset();
  });

  it('updates installed pack displayName when catalog title is available', () => {
    listInstalledPacks.mockReturnValue([
      {
        packId: 'en-grade3-v1-rj',
        displayName: 'en-grade3-v1-rj',
        packVersion: '1.0.2',
        sqlitePath: '/packs/en-grade3-v1-rj/pack.sqlite',
        assetsDir: '/packs/en-grade3-v1-rj/assets/',
        installStatus: 'installed',
        installedAt: '2026-07-31T08:00:00.000Z',
        lastOpenedAt: null,
      },
    ]);

    const updatedCount = syncInstalledPackDisplayNamesFromCatalog([catalogItem]);

    expect(updatedCount).toBe(1);
    expect(upsertInstalledPack).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: '三年级上册人教版单词表' }),
      undefined,
    );
  });

  it('skips packs already using catalog title', () => {
    listInstalledPacks.mockReturnValue([
      {
        packId: 'en-grade3-v1-rj',
        displayName: '三年级上册人教版单词表',
        packVersion: '1.0.2',
        sqlitePath: '/packs/en-grade3-v1-rj/pack.sqlite',
        assetsDir: '/packs/en-grade3-v1-rj/assets/',
        installStatus: 'installed',
        installedAt: '2026-07-31T08:00:00.000Z',
        lastOpenedAt: null,
      },
    ]);

    const updatedCount = syncInstalledPackDisplayNamesFromCatalog([catalogItem]);

    expect(updatedCount).toBe(0);
    expect(upsertInstalledPack).not.toHaveBeenCalled();
  });
});

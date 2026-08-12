import { describe, expect, it, vi } from 'vitest';

vi.mock('../data/pack/pack-card-details', () => ({
  getPackCardDetail: vi.fn((sqlitePath: string, knowledgeId: string) =>
    sqlitePath === '/pack/content.sqlite' && knowledgeId === 'content-pack:en:word:one'
      ? { knowledgeId }
      : null,
  ),
}));

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack: vi.fn((packId: string) => {
    if (packId === 'catalog-pack') {
      return {
        packId: 'catalog-pack',
        displayName: 'Catalog Pack',
        sqlitePath: '/pack/content.sqlite',
      };
    }
    if (packId === 'content-pack') {
      return null;
    }
    return null;
  }),
  listInstalledPacks: vi.fn(() => [
    {
      packId: 'catalog-pack',
      displayName: 'Catalog Pack',
      sqlitePath: '/pack/content.sqlite',
    },
  ]),
}));

import { resolveInstalledPackForKnowledgeId } from './resolve-installed-pack-for-knowledge';

describe('resolveInstalledPackForKnowledgeId', () => {
  it('learning state 记录 content packId 时仍可通过 catalog 别名加载', () => {
    const pack = resolveInstalledPackForKnowledgeId('content-pack:en:word:one', 'content-pack');

    expect(pack?.packId).toBe('catalog-pack');
  });
});

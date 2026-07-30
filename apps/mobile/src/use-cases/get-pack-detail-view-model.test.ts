import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/api/catalog-api', () => ({
  fetchCatalogPackDetail: vi.fn(),
}));

vi.mock('../data/catalog/catalog-cache-store', () => ({
  findCatalogItemOffline: vi.fn(),
}));

vi.mock('../data/repositories/installed-pack-repository', () => ({
  getInstalledPack: vi.fn(() => null),
}));

vi.mock('../data/session/session-store', () => ({
  readSessionToken: vi.fn(() => null),
}));

import { ApiNetworkError, ApiRequestError } from '../data/api/api-errors';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { findCatalogItemOffline } from '../data/catalog/catalog-cache-store';
import type { CatalogPackItem } from '../catalog/catalog-seed';
import { resolveCatalogItemForDetail } from './resolve-catalog-item-for-detail';

const offlineItem: CatalogPackItem = {
  packId: 'remember-test-pack',
  title: '记得测试包',
  primaryCategory: 'junior',
  secondaryCategory: '七年级',
  version: '人教版',
  contentTags: ['词汇'],
  cardCount: 2,
  sizeLabel: '约 2 MB',
  updatedAt: '2026-07-28',
  priceCents: 1,
  priceLabel: '¥0.01',
  summary: '测试包摘要',
  sampleHeadwords: ['picture'],
  isBundledTestPack: true,
};

describe('resolveCatalogItemForDetail', () => {
  beforeEach(() => {
    vi.mocked(fetchCatalogPackDetail).mockReset();
    vi.mocked(findCatalogItemOffline).mockReset();
  });

  it('API 超时时回退本地目录', async () => {
    vi.mocked(fetchCatalogPackDetail).mockRejectedValue(new ApiNetworkError('连接服务器超时'));
    vi.mocked(findCatalogItemOffline).mockResolvedValue(offlineItem);

    await expect(resolveCatalogItemForDetail('remember-test-pack')).resolves.toEqual(offlineItem);
  });

  it('API 404 时回退本地目录', async () => {
    vi.mocked(fetchCatalogPackDetail).mockRejectedValue(
      new ApiRequestError(404, 'PACK_NOT_FOUND', '未找到'),
    );
    vi.mocked(findCatalogItemOffline).mockResolvedValue(offlineItem);

    await expect(resolveCatalogItemForDetail('remember-test-pack')).resolves.toEqual(offlineItem);
  });

  it('401 等业务错误不回退', async () => {
    vi.mocked(fetchCatalogPackDetail).mockRejectedValue(
      new ApiRequestError(401, 'UNAUTHORIZED', '未登录'),
    );

    await expect(resolveCatalogItemForDetail('remember-test-pack')).rejects.toMatchObject({
      status: 401,
    });
    expect(findCatalogItemOffline).not.toHaveBeenCalled();
  });
});

import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CATALOG_ALL_VERSION_LABEL } from '@remember/contracts';
import { resolvePackTaxonomy } from './resolve-pack-taxonomy.js';

describe('resolvePackTaxonomy', () => {
  const prisma = {
    catalogPrimaryNode: { findUnique: vi.fn() },
    catalogSecondaryNode: { findUnique: vi.fn(), findFirst: vi.fn() },
    catalogVersionNode: { findUnique: vi.fn(), findFirst: vi.fn() },
  };

  beforeEach(() => {
    prisma.catalogPrimaryNode.findUnique.mockReset();
    prisma.catalogSecondaryNode.findUnique.mockReset();
    prisma.catalogSecondaryNode.findFirst.mockReset();
    prisma.catalogVersionNode.findUnique.mockReset();
    prisma.catalogVersionNode.findFirst.mockReset();
  });

  it('页内分类留空时写入 versionLabel=全部 且 versionNodeId=null', async () => {
    prisma.catalogPrimaryNode.findUnique.mockResolvedValue({
      id: 'primary-1',
      slug: 'primary',
    });
    prisma.catalogSecondaryNode.findUnique.mockResolvedValue({
      id: 'secondary-1',
      label: '三年级',
      primaryId: 'primary-1',
    });

    const resolved = await resolvePackTaxonomy(prisma as never, {
      primaryNodeId: 'primary-1',
      secondaryNodeId: 'secondary-1',
    });

    expect(resolved).toEqual({
      primaryNodeId: 'primary-1',
      secondaryNodeId: 'secondary-1',
      versionNodeId: null,
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionLabel: CATALOG_ALL_VERSION_LABEL,
    });
  });

  it('缺少一级或二级分类时拒绝', async () => {
    await expect(
      resolvePackTaxonomy(prisma as never, {
        primaryNodeId: 'primary-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

import { describe, expect, it } from 'vitest';
import {
  toAdminPrimaryTaxonomyNode,
  toAdminSecondaryTaxonomyNode,
  toAdminVersionTaxonomyNode,
} from './admin-catalog-taxonomy.mapper.js';

const timestamps = {
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

describe('admin catalog taxonomy mapper', () => {
  it('maps primary node without Prisma timestamp fields', () => {
    const mapped = toAdminPrimaryTaxonomyNode({
      id: 'a1000001-0000-4000-8000-000000000099',
      slug: 'custom',
      label: '自定义',
      sortOrder: 9,
      status: 'active',
      ...timestamps,
    });

    expect(mapped).toEqual({
      id: 'a1000001-0000-4000-8000-000000000099',
      slug: 'custom',
      label: '自定义',
      sortOrder: 9,
      status: 'active',
    });
  });

  it('maps secondary node without Prisma timestamp fields', () => {
    const mapped = toAdminSecondaryTaxonomyNode({
      id: 'c3000001-0000-4000-8000-000000000099',
      primaryId: 'a1000001-0000-4000-8000-000000000001',
      slug: 'grade7',
      label: '七年级',
      sortOrder: 1,
      status: 'active',
      ...timestamps,
    });

    expect(mapped.slug).toBe('grade7');
  });

  it('maps version node without Prisma timestamp fields', () => {
    const mapped = toAdminVersionTaxonomyNode({
      id: 'b2000001-0000-4000-8000-000000000099',
      slug: 'custom-version',
      label: '自定义版本',
      sortOrder: 4,
      status: 'active',
      ...timestamps,
    });

    expect(mapped.label).toBe('自定义版本');
  });
});

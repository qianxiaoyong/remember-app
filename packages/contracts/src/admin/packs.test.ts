import { describe, expect, it } from 'vitest';
import { adminCreatePackRequestSchema } from './packs.js';

describe('adminCreatePackRequestSchema', () => {
  it('允许省略页内分类（versionNodeId）', () => {
    const parsed = adminCreatePackRequestSchema.parse({
      packId: 'all-version-pack',
      title: '不限页内分类',
      primaryNodeId: '550e8400-e29b-41d4-a716-446655440001',
      secondaryNodeId: '550e8400-e29b-41d4-a716-446655440002',
      summary: '测试',
      priceCents: 100,
    });
    expect(parsed.versionNodeId).toBeUndefined();
  });

  it('legacy 路径允许省略 versionLabel', () => {
    const parsed = adminCreatePackRequestSchema.parse({
      packId: 'legacy-all-version-pack',
      title: '不限页内分类',
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      summary: '测试',
      priceCents: 100,
    });
    expect(parsed.versionLabel).toBeUndefined();
  });
});

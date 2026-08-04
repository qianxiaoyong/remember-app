import { describe, expect, it } from 'vitest';
import {
  adminLoginRequestSchema,
  adminLoginResponseSchema,
  adminLogoutResponseSchema,
} from './login.js';
import { adminSessionUserSchema } from './session-admin.js';
import { auditLogEntrySchema, auditLogWriteInputSchema } from './audit-log-entry.js';
import { adminUpdatePackRequestSchema } from './packs.js';
import {
  adminListUsersQuerySchema,
  adminUserDetailSchema,
  adminUserListResponseSchema,
} from './users.js';
import {
  adminLexiconBatchGetRequestSchema,
  adminLexiconDetailSchema,
  adminLexiconEnrichRequestSchema,
  adminLexiconPatchRequestSchema,
  adminLexiconSearchResponseSchema,
  definitionZhContentSchema,
  exampleContentSchema,
  lemmaFragmentContentSchema,
} from './lexicon.js';

describe('admin contracts', () => {
  it('adminLogin round-trip', () => {
    const request = adminLoginRequestSchema.parse({
      loginName: 'admin',
      password: 'dev-password',
    });
    expect(request.loginName).toBe('admin');

    const response = adminLoginResponseSchema.parse({
      token: 'opaque-admin-token',
      admin: {
        adminUserId: '550e8400-e29b-41d4-a716-446655440001',
        loginName: 'admin',
        role: 'super_admin',
      },
    });
    expect(response.admin.role).toBe('super_admin');
  });

  it('adminSessionUser 拒绝未知字段', () => {
    expect(() =>
      adminSessionUserSchema.parse({
        adminUserId: '550e8400-e29b-41d4-a716-446655440001',
        loginName: 'admin',
        role: 'super_admin',
        extra: true,
      }),
    ).toThrow();
  });

  it('拒绝过短密码与空 loginName', () => {
    expect(() =>
      adminLoginRequestSchema.parse({ loginName: 'admin', password: 'short' }),
    ).toThrow();
    expect(() =>
      adminLoginRequestSchema.parse({ loginName: '', password: 'long-enough' }),
    ).toThrow();
  });

  it('auditLogWriteInput round-trip', () => {
    const input = auditLogWriteInputSchema.parse({
      action: 'pack_access.grant',
      targetType: 'pack_access',
      targetId: 'remember-test-pack',
      payloadSummary: {
        packId: 'remember-test-pack',
        userId: '550e8400-e29b-41d4-a716-446655440001',
      },
      result: 'success',
    });
    expect(input.action).toBe('pack_access.grant');
  });

  it('auditLogEntry 含 ISO 时间', () => {
    const entry = auditLogEntrySchema.parse({
      id: '550e8400-e29b-41d4-a716-446655440002',
      actorAdminUserId: '550e8400-e29b-41d4-a716-446655440001',
      action: 'refund.create',
      targetType: 'order',
      targetId: '550e8400-e29b-41d4-a716-446655440003',
      payloadSummary: { amountCents: 1990 },
      result: 'failure',
      errorCode: 'REFUND_NOT_ALLOWED',
      createdAt: '2026-07-31T02:00:00.000Z',
    });
    expect(entry.errorCode).toBe('REFUND_NOT_ALLOWED');
  });

  it('adminLogoutResponse 仅接受 ok:true', () => {
    expect(adminLogoutResponseSchema.parse({ ok: true })).toEqual({ ok: true });
    expect(() => adminLogoutResponseSchema.parse({ ok: false })).toThrow();
  });

  it('adminUpdatePackRequest 接受封面与包含内容字段', () => {
    const parsed = adminUpdatePackRequestSchema.parse({
      coverUrl: 'https://cdn.example.com/cover.jpg',
      coverBadge: 'PEP 3A',
      coverLines: ['三年级', '上册'],
      includedHighlights: [{ title: '核心词汇', description: '单词与释义' }],
      contentTags: ['词汇', '上册'],
    });
    expect(parsed.coverBadge).toBe('PEP 3A');
    expect(parsed.includedHighlights).toHaveLength(1);
  });

  it('adminUpdatePackRequest 未传 status 时不默认 draft', () => {
    const parsed = adminUpdatePackRequestSchema.parse({
      contentTags: ['词汇'],
      summary: '测试',
      priceCents: 100,
    });
    expect(parsed.status).toBeUndefined();
    expect(parsed.cardCount).toBeUndefined();
  });

  it('adminUpdatePackRequest 忽略 React Admin 只读字段与空 displayTitle', () => {
    const parsed = adminUpdatePackRequestSchema.parse({
      id: 'en-grade3-v1-rj',
      packId: 'en-grade3-v1-rj',
      title: '三年级上册人教版单词表',
      displayTitle: '',
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionLabel: '人教版',
      priceCents: 100,
      status: 'published',
      summary: '测试',
      contentTags: [],
      cardCount: 0,
      sizeLabel: '未知',
      updatedAt: '2026-07-31T06:12:09.000Z',
      currentPackVersion: '1.0.0',
      protocolVersion: 1,
    });
    expect(parsed.status).toBe('published');
    expect(parsed.displayTitle).toBeUndefined();
    expect('id' in parsed).toBe(false);
    expect('updatedAt' in parsed).toBe(false);
  });

  it('adminUserListResponse 不含 phoneHash', () => {
    const response = adminUserListResponseSchema.parse({
      items: [
        {
          userId: '550e8400-e29b-41d4-a716-446655440010',
          maskedPhone: '138****8000',
          status: 'active',
          createdAt: '2026-07-31T02:00:00.000Z',
          updatedAt: '2026-07-31T02:00:00.000Z',
          packAccessCount: 0,
          paidOrderCount: 1,
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    expect(response.items[0]?.maskedPhone).toBe('138****8000');
    expect(() =>
      adminUserListResponseSchema.parse({
        items: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440010',
            maskedPhone: '138****8000',
            phoneHash: 'secret',
            status: 'active',
            createdAt: '2026-07-31T02:00:00.000Z',
            updatedAt: '2026-07-31T02:00:00.000Z',
            packAccessCount: 0,
            paidOrderCount: 0,
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      }),
    ).toThrow();
  });

  it('adminListUsersQuery 接受注册时间筛选', () => {
    const query = adminListUsersQuerySchema.parse({
      registeredSince: '2026-07-24T00:00:00.000Z',
      page: 1,
    });
    expect(query.registeredSince).toBe('2026-07-24T00:00:00.000Z');
  });

  it('adminUserDetail 可含 mainDeviceId', () => {
    const detail = adminUserDetailSchema.parse({
      userId: '550e8400-e29b-41d4-a716-446655440010',
      maskedPhone: '138****8000',
      status: 'active',
      createdAt: '2026-07-31T02:00:00.000Z',
      updatedAt: '2026-07-31T02:00:00.000Z',
      mainDeviceId: '11111111-1111-4111-8111-111111111111',
      packAccessCount: 2,
      paidOrderCount: 1,
    });
    expect(detail.mainDeviceId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('adminLexiconSearchResponse round-trip', () => {
    const response = adminLexiconSearchResponseSchema.parse({
      items: [
        {
          lemmaKey: 'go',
          headword: 'go',
          status: 'published',
          ipa: '/ɡoʊ/',
          source: 'ecdict',
        },
        {
          lemmaKey: 'gone',
          headword: 'gone',
          status: 'draft',
          source: 'manual',
        },
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });
    expect(response.items[0]?.status).toBe('published');
  });

  it('adminLexiconDetail 拒绝未知字段', () => {
    expect(() =>
      adminLexiconDetailSchema.parse({
        id: '550e8400-e29b-41d4-a716-446655440020',
        lemmaKey: 'go',
        headword: 'go',
        status: 'published',
        source: 'ecdict',
        createdAt: '2026-08-04T02:00:00.000Z',
        updatedAt: '2026-08-04T02:00:00.000Z',
        fragments: [],
        forms: [],
        assets: [],
        tags: [],
        extra: true,
      }),
    ).toThrow();
  });

  it('lemmaFragmentContent 按类型校验 content', () => {
    const parsed = lemmaFragmentContentSchema.parse({
      fragmentType: 'example',
      content: { en: 'I go home.', zh: '我回家。' },
    });
    expect(parsed.fragmentType).toBe('example');

    expect(() =>
      definitionZhContentSchema.parse({ text: '走', pos: 'v.', unknown: true }),
    ).toThrow();
    expect(() =>
      exampleContentSchema.parse({ en: 'Hi', zh: '你好', note: 'x', extra: 1 }),
    ).toThrow();
  });

  it('adminLexiconPatchRequest 拒绝无 id 的 delete', () => {
    expect(() =>
      adminLexiconPatchRequestSchema.parse({
        patches: [
          {
            lemmaKey: 'go',
            fragments: [
              {
                fragmentType: 'note',
                content: { text: 'x' },
                sortOrder: 0,
                source: 'manual',
                delete: true,
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });

  it('adminLexiconBatchGetRequest 限制批量大小', () => {
    expect(() => adminLexiconBatchGetRequestSchema.parse({ lemmaKeys: [] })).toThrow();
  });

  it('adminLexiconEnrichRequest round-trip', () => {
    const request = adminLexiconEnrichRequestSchema.parse({
      lemmaKey: 'go',
      fragmentTypes: ['definition_zh', 'example'],
      context: '三年级动词',
    });
    expect(request.fragmentTypes).toHaveLength(2);
  });
});

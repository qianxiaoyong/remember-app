import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  adminLexiconBatchGetResponseSchema,
  adminLexiconByFormResponseSchema,
  adminLexiconDetailSchema,
  adminLexiconEnrichResponseSchema,
  adminLexiconPatchResponseSchema,
  adminLexiconSearchResponseSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import {
  adminLogin,
  appUserLogin,
  type HttpServer,
  seedAdminUser,
} from './helpers/admin-test-helper.js';
import {
  createIntegrationPrismaClient,
  resetAuthTables,
  resetContentLexiconTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

async function seedLexiconFixtures(prisma: PrismaClient): Promise<void> {
  const published = await prisma.contentLemma.create({
    data: {
      lemmaKey: 'go',
      headword: 'go',
      status: 'published',
      source: 'manual',
      ipa: '/ɡoʊ/',
      pos: 'v.',
      publishedAt: new Date('2026-08-04T00:00:00.000Z'),
      fragments: {
        create: [
          {
            fragmentType: 'definition_zh',
            content: { text: '去；走' },
            sortOrder: 0,
            source: 'manual',
          },
        ],
      },
      forms: {
        create: [
          {
            formKey: 'went',
            formType: 'past',
            displayForm: 'went',
            source: 'manual',
          },
        ],
      },
    },
  });

  await prisma.contentLemma.create({
    data: {
      lemmaKey: 'gone',
      headword: 'gone',
      status: 'draft',
      source: 'manual',
    },
  });

  await prisma.contentTag.create({
    data: {
      tagKey: 'story',
      labelZh: '故事',
      lemmaLinks: {
        create: [{ lemmaId: published.id }],
      },
    },
  });
}

describe('admin lexicon API', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
    applyIntegrationTestEnv();

    prisma = createIntegrationPrismaClient();
    await prisma.$connect();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await resetAuthTables(prisma);
    await resetContentLexiconTables(prisma);
    await seedCatalogFixtures(prisma);
    await seedAdminUser(prisma);
    await seedLexiconFixtures(prisma);
  });

  it('无 admin token 访问 lexicon 返回 401', async () => {
    const server = app.getHttpServer() as HttpServer;
    const response = await request(server).get('/api/v1/admin/lexicon/search?q=go');
    expect(response.status).toBe(401);
  });

  it('App token 不能访问 admin lexicon', async () => {
    const server = app.getHttpServer() as HttpServer;
    const appUser = await appUserLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/lexicon/search?q=go')
      .set('Authorization', `Bearer ${appUser.token}`);
    expect(response.status).toBe(401);
  });

  it('search 含 draft 且 published 排序优先', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/lexicon/search?q=go')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const body = adminLexiconSearchResponseSchema.parse(response.body);
    expect(body.total).toBe(2);
    expect(body.items[0]?.lemmaKey).toBe('go');
    expect(body.items[0]?.status).toBe('published');
    expect(body.items[1]?.lemmaKey).toBe('gone');
    expect(body.items[1]?.status).toBe('draft');
  });

  it('search 无 q 时返回全部词条分页', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/lexicon/search?limit=10&offset=0')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const body = adminLexiconSearchResponseSchema.parse(response.body);
    expect(body.total).toBe(2);
    expect(body.items).toHaveLength(2);
    expect(body.items[0]?.lemmaKey).toBe('go');
  });

  it('search 支持 sortBy 排序', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/lexicon/search?sortBy=lemmaKey&sortOrder=desc&limit=10')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const body = adminLexiconSearchResponseSchema.parse(response.body);
    expect(body.items[0]?.lemmaKey).toBe('gone');
    expect(body.items[1]?.lemmaKey).toBe('go');
  });

  it('GET detail / by-form / batch-get', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const detailResponse = await request(server)
      .get('/api/v1/admin/lexicon/go')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const detail = adminLexiconDetailSchema.parse(detailResponse.body);
    expect(detail.fragments).toHaveLength(1);
    expect(detail.forms[0]?.formKey).toBe('went');
    expect(detail.tags[0]?.tagKey).toBe('story');

    const byFormResponse = await request(server)
      .get('/api/v1/admin/lexicon/by-form/went')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const byForm = adminLexiconByFormResponseSchema.parse(byFormResponse.body);
    expect(byForm.lemma.lemmaKey).toBe('go');

    const batchResponse = await request(server)
      .post('/api/v1/admin/lexicon/batch-get')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ lemmaKeys: ['go', 'missing-word'] })
      .expect(200);
    const batch = adminLexiconBatchGetResponseSchema.parse(batchResponse.body);
    expect(batch.items).toHaveLength(1);
    expect(batch.missingLemmaKeys).toEqual(['missing-word']);
  });

  it('PATCH 更新词条并写 audit_logs', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .patch('/api/v1/admin/lexicon')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        patches: [
          {
            lemmaKey: 'gone',
            headword: 'gone',
            status: 'published',
            fragments: [
              {
                fragmentType: 'note',
                content: { text: '审核通过' },
                sortOrder: 0,
                source: 'manual',
              },
            ],
          },
        ],
      })
      .expect(200);

    const body = adminLexiconPatchResponseSchema.parse(response.body);
    expect(body.updatedLemmaKeys).toEqual(['gone']);

    const audits = await prisma.auditLog.findMany({
      where: { action: 'lexicon.publish', targetId: 'gone' },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]?.result).toBe('success');

    const detailResponse = await request(server)
      .get('/api/v1/admin/lexicon/gone')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const detail = adminLexiconDetailSchema.parse(detailResponse.body);
    expect(detail.status).toBe('published');
    expect(detail.fragments[0]?.content).toEqual({ text: '审核通过' });
  });

  it('enrich 返回 llm 草稿片段', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .post('/api/v1/admin/lexicon/enrich')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        lemmaKey: 'go',
        fragmentTypes: ['definition_zh', 'example'],
      })
      .expect(200);

    const body = adminLexiconEnrichResponseSchema.parse(response.body);
    expect(body.draftFragments).toHaveLength(2);
    expect(body.draftFragments[0]?.source).toBe('llm');
  });

  describe('enrich 并发限流', () => {
    let rateLimitApp: INestApplication;

    beforeAll(async () => {
      process.env.LEXICON_ENRICH_MAX_CONCURRENT = '1';
      process.env.LEXICON_ENRICH_TEST_DELAY_MS = '300';

      const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
      rateLimitApp = moduleRef.createNestApplication();
      rateLimitApp.setGlobalPrefix('api/v1');
      await rateLimitApp.init();
    });

    afterAll(async () => {
      await rateLimitApp.close();
      delete process.env.LEXICON_ENRICH_TEST_DELAY_MS;
      process.env.LEXICON_ENRICH_MAX_CONCURRENT = '5';
    });

    it('并发 enrich 超限时返回 LEXICON_ENRICH_RATE_LIMITED', async () => {
      const server = rateLimitApp.getHttpServer() as HttpServer;
      const admin = await adminLogin(server);

      const enrichPayload = (lemmaKey: string) => ({
        lemmaKey,
        fragmentTypes: ['definition_zh'],
      });

      const [firstResponse, secondResponse] = await Promise.all([
        request(server)
          .post('/api/v1/admin/lexicon/enrich')
          .set('Authorization', `Bearer ${admin.token}`)
          .send(enrichPayload('go')),
        request(server)
          .post('/api/v1/admin/lexicon/enrich')
          .set('Authorization', `Bearer ${admin.token}`)
          .send(enrichPayload('gone')),
      ]);

      const statuses = [firstResponse.status, secondResponse.status];
      expect(statuses).toContain(200);
      expect(statuses).toContain(429);

      const rateLimited = [firstResponse, secondResponse].find(
        (response) => response.status === 429,
      );
      expect(rateLimited?.body).toMatchObject({
        code: 'LEXICON_ENRICH_RATE_LIMITED',
      });
    });
  });
});

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  adminContentTagVocabularyListResponseSchema,
  adminPackDetailResponseSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { adminLogin, seedAdminUser, type HttpServer } from './helpers/admin-test-helper.js';
import {
  createIntegrationPrismaClient,
  resetAuthTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

describe('admin content tags integration', () => {
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
    await seedCatalogFixtures(prisma);
    await seedAdminUser(prisma);
  });

  it('内容标签词库：保存入库、列表可选、删词库不影响 pack', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const emptyList = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(adminContentTagVocabularyListResponseSchema.parse(emptyList.body).items).toEqual([]);

    await request(server)
      .patch('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ contentTags: ['英语词汇', '专项'] })
      .expect(200);

    const listAfterSave = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const labels = adminContentTagVocabularyListResponseSchema
      .parse(listAfterSave.body)
      .items.map((item) => item.label);
    expect(labels).toEqual(expect.arrayContaining(['英语词汇', '专项']));

    await request(server)
      .post('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ labels: ['即时入库'] })
      .expect(204);

    const listAfterUpsert = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(
      adminContentTagVocabularyListResponseSchema
        .parse(listAfterUpsert.body)
        .items.map((item) => item.label),
    ).toEqual(expect.arrayContaining(['即时入库']));

    await request(server)
      .delete('/api/v1/admin/content-tags/' + encodeURIComponent('英语词汇'))
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);

    const listAfterDelete = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(
      adminContentTagVocabularyListResponseSchema
        .parse(listAfterDelete.body)
        .items.map((item) => item.label),
    ).toEqual(['专项', '即时入库']);

    const detailResponse = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(adminPackDetailResponseSchema.parse(detailResponse.body).pack.contentTags).toEqual([
      '英语词汇',
      '专项',
    ]);
  });
});

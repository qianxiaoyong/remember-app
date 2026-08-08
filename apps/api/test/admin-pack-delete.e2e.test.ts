import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { adminLogin, type HttpServer, seedAdminUser } from './helpers/admin-test-helper.js';
import {
  createIntegrationPrismaClient,
  resetAuthTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

describe('admin pack delete', () => {
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
    await seedAdminUser(prisma);
  });

  beforeEach(async () => {
    await resetAuthTables(prisma);
    await seedCatalogFixtures(prisma);
    await seedAdminUser(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('DELETE 无交易记录的知识库可删除', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    await request(server)
      .post('/api/v1/admin/packs')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        packId: 'delete-me-pack',
        title: '待删除包',
        primaryCategory: 'primary',
        secondaryCategory: '三年级',
        versionLabel: '人教版',
        summary: '测试删除',
        priceCents: 100,
        status: 'draft',
      })
      .expect(201);

    await request(server)
      .delete('/api/v1/admin/packs/delete-me-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);

    await request(server)
      .get('/api/v1/admin/packs/delete-me-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(404);

    const audits = await prisma.auditLog.findMany({ where: { action: 'pack.delete' } });
    expect(audits.some((row) => row.targetId === 'delete-me-pack')).toBe(true);
  });
});

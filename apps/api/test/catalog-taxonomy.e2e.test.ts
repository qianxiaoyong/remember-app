import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { catalogTaxonomyResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import {
  createIntegrationPrismaClient,
  resetCommerceTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }
  return databaseUrl;
}

describe('catalog taxonomy API', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    applyIntegrationTestEnv();
    requireDatabaseUrl();
    prisma = createIntegrationPrismaClient();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  beforeEach(async () => {
    await resetCommerceTables(prisma);
    await seedCatalogFixtures(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('GET /catalog/taxonomy returns active taxonomy tree', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/catalog/taxonomy').expect(200);
    const body = catalogTaxonomyResponseSchema.parse(response.body);
    expect(body.primaries.length).toBeGreaterThan(0);
    expect(body.versions.some((version) => version.label === '人教版')).toBe(true);

    const primary = body.primaries.find((node) => node.slug === 'primary');
    expect(primary?.children.some((child) => child.label === '三年级')).toBe(true);
  });
});

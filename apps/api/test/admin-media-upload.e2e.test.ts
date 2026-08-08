import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { adminMediaUploadResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { adminLogin, seedAdminUser, type HttpServer } from './helpers/admin-test-helper.js';
import { createIntegrationPrismaClient, resetAuthTables } from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

/** 1×1 透明 PNG */
const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('admin media upload integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let mediaDir: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
    mediaDir = await mkdtemp(join(tmpdir(), 'remember-media-test-'));
    process.env.ADMIN_MEDIA_STORAGE_DIR = mediaDir;
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
    await rm(mediaDir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await resetAuthTables(prisma);
    await seedAdminUser(prisma);
  });

  it('未登录上传返回 401', async () => {
    const server = app.getHttpServer() as HttpServer;
    const response = await request(server)
      .post('/api/v1/admin/media/upload')
      .attach('file', TINY_PNG, { filename: 'cover.png', contentType: 'image/png' });
    expect(response.status).toBe(401);
  });

  it('上传 png 返回可访问 URL', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const uploadResponse = await request(server)
      .post('/api/v1/admin/media/upload')
      .set('Authorization', `Bearer ${admin.token}`)
      .attach('file', TINY_PNG, { filename: 'cover.png', contentType: 'image/png' })
      .expect(200);

    const body = adminMediaUploadResponseSchema.parse(uploadResponse.body);
    expect(body.url).toMatch(/\/api\/v1\/media\/[0-9a-f-]+\.png$/);

    const mediaPath = body.url.replace(/^.*\/api\/v1\/media\//, '');
    const serveResponse = await request(server).get(`/api/v1/media/${mediaPath}`).expect(200);
    expect(serveResponse.headers['content-type']).toMatch(/^image\/png/);
    expect(serveResponse.body).toEqual(TINY_PNG);

    const savedFiles = await readFile(join(mediaDir, mediaPath));
    expect(savedFiles.equals(TINY_PNG)).toBe(true);
  });

  it('非法类型返回 400', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .post('/api/v1/admin/media/upload')
      .set('Authorization', `Bearer ${admin.token}`)
      .attach('file', Buffer.from('not-an-image'), {
        filename: 'bad.txt',
        contentType: 'text/plain',
      });
    expect(response.status).toBe(400);
  });
});

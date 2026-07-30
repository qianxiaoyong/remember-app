import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  packDownloadAuthorizationResponseSchema,
  redeemCodeResponseSchema,
  verifySmsCodeResponseSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import {
  createIntegrationPrismaClient,
  resetAllIntegrationTables,
  seedCatalogFixtures,
  TEST_REDEMPTION_CODE,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

const TEST_PHONE = '13800138300';
const DEVICE_A = '88888888-8888-4888-8888-888888888888';

async function login(
  server: Parameters<typeof request>[0],
): Promise<{ token: string; userId: string }> {
  await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
  const response = await request(server)
    .post('/api/v1/auth/sms/verify')
    .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
    .expect(200);
  const body = verifySmsCodeResponseSchema.parse(response.body);
  return { token: body.token, userId: body.user.userId };
}

describe('pack download integration', () => {
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
    await resetAllIntegrationTables(prisma);
    await seedCatalogFixtures(prisma);
  });

  it('无 pack_access 时下载授权返回 403', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const loginResult = await login(server);

    const response = await request(server)
      .post('/api/v1/packs/demo-primary-grade3/download-authorization')
      .set('Authorization', `Bearer ${loginResult.token}`)
      .expect(403);
    expect(response.body).toMatchObject({ code: 'PACK_ACCESS_DENIED' });
  });

  it('兑换后可获取下载授权并下载 zip', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const loginResult = await login(server);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${loginResult.token}`)
      .send({ code: TEST_REDEMPTION_CODE })
      .expect(200);

    const authResponse = await request(server)
      .post('/api/v1/packs/remember-test-pack/download-authorization')
      .set('Authorization', `Bearer ${loginResult.token}`)
      .expect(200);
    const authBody = packDownloadAuthorizationResponseSchema.parse(authResponse.body);
    expect(authBody.packId).toBe('remember-test-pack');
    expect(authBody.downloadUrl).toContain('/download?token=');

    const downloadPath =
      new URL(authBody.downloadUrl).pathname + new URL(authBody.downloadUrl).search;
    const downloadResponse = await request(server)
      .get(downloadPath)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          callback(null, Buffer.concat(chunks));
        });
      })
      .expect(200);
    expect(downloadResponse.headers['content-type']).toContain('application/zip');
    const downloadBody = downloadResponse.body as Buffer;
    expect(downloadBody.byteLength).toBeGreaterThan(100);
  });

  it('三年级兑换后授权含 devContentPackId', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const loginResult = await login(server);

    const redeem = await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${loginResult.token}`)
      .send({ code: 'TEST-REDEEM-GRADE3' })
      .expect(200);
    redeemCodeResponseSchema.parse(redeem.body);

    const authResponse = await request(server)
      .post('/api/v1/packs/demo-primary-grade3/download-authorization')
      .set('Authorization', `Bearer ${loginResult.token}`)
      .expect(200);
    const authBody = packDownloadAuthorizationResponseSchema.parse(authResponse.body);
    expect(authBody.devContentPackId).toBe('remember-test-pack');
  });
});

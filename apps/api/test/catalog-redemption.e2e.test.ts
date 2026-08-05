import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  catalogPackDetailSchema,
  listCatalogPacksResponseSchema,
  listMyPackAccessResponseSchema,
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

const TEST_PHONE = '13800138001';
const DEVICE_A = '33333333-3333-4333-8333-333333333333';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }
  return databaseUrl;
}

async function sendSmsCode(server: Parameters<typeof request>[0], phone: string): Promise<void> {
  await request(server).post('/api/v1/auth/sms/send').send({ phone }).expect(200);
}

async function verifySmsLogin(
  server: Parameters<typeof request>[0],
  phone: string,
  deviceId: string,
): Promise<{ token: string; userId: string }> {
  const response = await request(server)
    .post('/api/v1/auth/sms/verify')
    .send({ phone, code: '000000', deviceId })
    .expect(200);

  const body = verifySmsCodeResponseSchema.parse(response.body);
  return { token: body.token, userId: body.user.userId };
}

describe('catalog and redemption integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    requireDatabaseUrl();
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

  it('GET /catalog/packs 无需登录', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/catalog/packs').expect(200);
    const body = listCatalogPacksResponseSchema.parse(response.body);
    expect(body.items.length).toBeGreaterThanOrEqual(1);
    expect(body.items.some((item) => item.packId === 'remember-test-pack')).toBe(true);
    const testPack = body.items.find((item) => item.packId === 'remember-test-pack');
    expect(testPack?.summary).toContain('测试');
  });

  it('GET /catalog/packs/:packId 含 samplePreviews', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .get('/api/v1/catalog/packs/remember-test-pack')
      .expect(200);
    const body = catalogPackDetailSchema.parse(response.body);
    expect(body.samplePreviews.length).toBeGreaterThanOrEqual(1);
    expect(body.isBundledTestPack).toBe(true);
    expect(body.currentPackVersion).toBe('1.0.0');
    expect(body.protocolVersion).toBe(1);
  });

  it('GET /catalog/packs/missing 返回 404', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/catalog/packs/missing-pack').expect(404);
    expect(response.body).toMatchObject({ code: 'PACK_NOT_FOUND' });
  });

  it('GET /app/release 未配置时返回 404', async () => {
    delete process.env.APP_RELEASE_MIN_ANDROID_VERSION;
    delete process.env.APP_RELEASE_LATEST_APK_URL;
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/app/release').expect(404);
    expect(response.body).toMatchObject({ code: 'APP_RELEASE_NOT_CONFIGURED' });
  });

  it('POST /redemption/redeem 未登录返回 401', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .post('/api/v1/redemption/redeem')
      .send({ code: TEST_REDEMPTION_CODE })
      .expect(401);
    expect(response.body).toMatchObject({ code: 'SESSION_MISSING' });
  });

  it('兑换成功写入 pack_access 且幂等', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const first = await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${login.token}`)
      .send({ code: TEST_REDEMPTION_CODE })
      .expect(200);
    const firstBody = redeemCodeResponseSchema.parse(first.body);
    expect(firstBody.packId).toBe('remember-test-pack');
    expect(firstBody.alreadyOwned).toBe(false);

    const accessCount = await prisma.packAccess.count({ where: { userId: login.userId } });
    expect(accessCount).toBe(1);

    const second = await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${login.token}`)
      .send({ code: TEST_REDEMPTION_CODE })
      .expect(200);
    const secondBody = redeemCodeResponseSchema.parse(second.body);
    expect(secondBody.alreadyOwned).toBe(true);

    const accessCountAfter = await prisma.packAccess.count({ where: { userId: login.userId } });
    expect(accessCountAfter).toBe(1);
  });

  it('GET /me/pack-access 返回已兑换 pack', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${login.token}`)
      .send({ code: TEST_REDEMPTION_CODE })
      .expect(200);

    const response = await request(server)
      .get('/api/v1/me/pack-access')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);
    const body = listMyPackAccessResponseSchema.parse(response.body);
    expect(body.items.some((item) => item.packId === 'remember-test-pack')).toBe(true);
  });

  it('无效兑换码返回 404', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const response = await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${login.token}`)
      .send({ code: 'INVALID-CODE' })
      .expect(404);
    expect(response.body).toMatchObject({ code: 'REDEMPTION_CODE_INVALID' });
  });

  it('兑换码达到上限后拒绝后续用户', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const { hashRedemptionCode } = await import('../src/redemption/redemption-code-hash.js');
    const { TEST_REDEMPTION_PEPPER } = await import('./helpers/catalog-test-helper.js');
    const singleUseCode = 'TEST-SINGLE-USE-001';
    await prisma.redemptionCode.create({
      data: {
        codeHash: hashRedemptionCode(singleUseCode, TEST_REDEMPTION_PEPPER),
        packId: 'remember-test-pack',
        maxRedemptions: 1,
        redeemedCount: 0,
        status: 'active',
      },
    });

    await sendSmsCode(server, '13800138011');
    const loginA = await verifySmsLogin(
      server,
      '13800138011',
      '11111111-1111-4111-8111-111111111111',
    );
    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${loginA.token}`)
      .send({ code: singleUseCode })
      .expect(200);

    await sendSmsCode(server, '13800138012');
    const loginB = await verifySmsLogin(
      server,
      '13800138012',
      '22222222-2222-4222-8222-222222222222',
    );
    const response = await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${loginB.token}`)
      .send({ code: singleUseCode })
      .expect(400);
    expect(response.body).toMatchObject({ code: 'REDEMPTION_CODE_EXHAUSTED' });
  });
});

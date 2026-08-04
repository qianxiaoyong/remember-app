import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  packDownloadAuthorizationResponseSchema,
  verifySmsCodeResponseSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { CosPackStorage } from '../src/storage/cos-pack-storage.js';
import {
  createIntegrationPrismaClient,
  resetAllIntegrationTables,
  seedCatalogFixtures,
  TEST_REDEMPTION_CODE,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

const TEST_PHONE = '13800138400';
const DEVICE_A = '88888888-8888-4888-8888-888888888881';
const PRESIGNED_URL =
  'https://remember-packs-1250000000.cos.ap-guangzhou.myqcloud.com/packs/remember-test-pack/1.0.0/pack.zip?sign=1';

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

describe('pack download COS integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const getPresignedDownloadUrl = vi.fn();

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
    applyIntegrationTestEnv();
    process.env.PACK_DOWNLOAD_MOCK_ENABLED = 'false';
    process.env.COS_ENABLED = 'true';
    process.env.COS_SECRET_ID = 'integration-cos-secret-id';
    process.env.COS_SECRET_KEY = 'integration-cos-secret-key';
    process.env.COS_REGION = 'ap-guangzhou';
    process.env.COS_BUCKET = 'remember-packs-1250000000';

    getPresignedDownloadUrl.mockResolvedValue(PRESIGNED_URL);

    prisma = createIntegrationPrismaClient();
    await prisma.$connect();

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CosPackStorage)
      .useValue({
        isEnabled: () => true,
        putObject: vi.fn(),
        getPresignedDownloadUrl,
      })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    getPresignedDownloadUrl.mockClear();
    getPresignedDownloadUrl.mockResolvedValue(PRESIGNED_URL);
    await resetAllIntegrationTables(prisma);
    await seedCatalogFixtures(prisma);
  });

  it('mock 关闭且 COS 启用时返回 presigned downloadUrl', async () => {
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
    expect(authBody.downloadUrl).toBe(PRESIGNED_URL);
    expect(authBody.downloadUrl).not.toContain('/api/v1/packs/');
    expect(authBody.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(authBody.sizeBytes).toBeGreaterThan(0);
    expect(getPresignedDownloadUrl).toHaveBeenCalledWith('packs/remember-test-pack/1.0.0/pack.zip');
  });
});

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { verifySmsCodeResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { createIntegrationPrismaClient, resetAuthTables } from './helpers/db-test-helper.js';

const TEST_PHONE = '13800138000';
const DEVICE_A = '11111111-1111-4111-8111-111111111111';
const DEVICE_B = '22222222-2222-4222-8222-222222222222';

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

interface VerifySmsLoginInput {
  phone: string;
  deviceId: string;
  code?: string;
}

async function verifySmsLogin(
  server: Parameters<typeof request>[0],
  input: VerifySmsLoginInput,
): Promise<{ token: string; userId: string }> {
  const response = await request(server)
    .post('/api/v1/auth/sms/verify')
    .send({ phone: input.phone, code: input.code ?? '000000', deviceId: input.deviceId })
    .expect(200);

  const body = verifySmsCodeResponseSchema.parse(response.body);
  return {
    token: body.token,
    userId: body.user.userId,
  };
}

describe('auth main device integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    requireDatabaseUrl();
    process.env.AUTH_PHONE_PEPPER ??= 'integration-test-pepper';
    process.env.SMS_MOCK_ENABLED ??= 'true';
    process.env.AUTH_SMS_RESEND_INTERVAL_MS ??= '0';

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
  });

  it('发码 + 验码登录成功，返回 token', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    expect(login.token.length).toBeGreaterThan(20);

    const meResponse = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);

    expect(meResponse.body).toEqual({
      userId: login.userId,
      maskedPhone: '138****8000',
      displayName: '监护人',
    });
  });

  it('错误验证码拒绝', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);

    const response = await request(server)
      .post('/api/v1/auth/sms/verify')
      .send({ phone: TEST_PHONE, code: '123456', deviceId: DEVICE_A })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'SMS_CODE_INVALID' });
  });

  it('成功登录后 challenge 标记 consumed', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    const challenge = await prisma.smsChallenge.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    expect(challenge?.consumedAt).not.toBeNull();
  });

  it('设备 B 登录后，设备 A 的 token 调写保护路由失败', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const deviceALogin = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await sendSmsCode(server, TEST_PHONE);
    await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_B });

    const writeResponse = await request(server)
      .post('/api/v1/auth/device/write-probe')
      .set('Authorization', `Bearer ${deviceALogin.token}`)
      .expect(403);

    expect(writeResponse.body).toMatchObject({ code: 'NOT_MAIN_DEVICE' });

    const meResponse = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${deviceALogin.token}`)
      .expect(403);

    expect(meResponse.body).toMatchObject({ code: 'NOT_MAIN_DEVICE' });
  });

  it('后登录设备成为唯一主设备', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await sendSmsCode(server, TEST_PHONE);
    const deviceBLogin = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_B });

    const user = await prisma.user.findFirst();
    expect(user?.mainDeviceId).toBe(DEVICE_B);

    const activeSessions = await prisma.session.findMany({
      where: { revokedAt: null, userId: deviceBLogin.userId },
    });
    expect(activeSessions).toHaveLength(2);
    expect(activeSessions.map((session) => session.deviceId).sort()).toEqual(
      [DEVICE_A, DEVICE_B].sort(),
    );

    await request(server)
      .post('/api/v1/auth/device/write-probe')
      .set('Authorization', `Bearer ${deviceBLogin.token}`)
      .expect(200);
  });
});

describe('auth session ttl integration', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    requireDatabaseUrl();
    process.env.AUTH_PHONE_PEPPER = 'integration-test-pepper';
    process.env.SMS_MOCK_ENABLED = 'true';
    process.env.AUTH_SMS_RESEND_INTERVAL_MS = '0';
    process.env.AUTH_SESSION_TTL_DAYS = '0.000001';

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
    delete process.env.AUTH_SESSION_TTL_DAYS;
  });

  beforeEach(async () => {
    await resetAuthTables(prisma);
  });

  it('session TTL 过期后拒绝访问', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await prisma.session.updateMany({
      data: { lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    });

    const response = await request(server)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(401);

    expect(response.body).toMatchObject({ code: 'SESSION_EXPIRED' });
  });
});

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  createOrderResponseSchema,
  listMyPackAccessResponseSchema,
  orderDetailResponseSchema,
  simulatePaymentNotifyResponseSchema,
  verifySmsCodeResponseSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import {
  createIntegrationPrismaClient,
  resetAllIntegrationTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

const TEST_PHONE = '13800138002';
const DEVICE_A = '44444444-4444-4444-8444-444444444444';
const PAID_PACK_ID = 'demo-primary-grade3';
const MOCK_NOTIFY_SECRET = 'integration-mock-notify-secret';

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

async function createPendingOrder(
  server: Parameters<typeof request>[0],
  token: string,
  packId: string,
): Promise<{ orderId: string; amountCents: number }> {
  const response = await request(server)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ packId })
    .expect(200);

  const body = createOrderResponseSchema.parse(response.body);
  expect(body.status).toBe('pending');
  return { orderId: body.orderId, amountCents: body.amountCents };
}

async function simulatePaymentNotify(
  server: Parameters<typeof request>[0],
  input: {
    orderId: string;
    amountCents: number;
    token?: string;
    notificationId?: string;
    transactionId?: string;
  },
): Promise<{ processed: boolean; status: string }> {
  let req = request(server).post('/api/v1/payment/test/simulate-notify');
  if (input.token) {
    req = req.set('Authorization', `Bearer ${input.token}`);
  } else {
    req = req.set('X-Mock-Payment-Secret', MOCK_NOTIFY_SECRET);
  }

  const response = await req
    .send({
      orderId: input.orderId,
      amountCents: input.amountCents,
      notificationId: input.notificationId,
      transactionId: input.transactionId,
    })
    .expect(200);

  const body = simulatePaymentNotifyResponseSchema.parse(response.body);
  return { processed: body.processed, status: body.status };
}

describe('payment idempotency integration', () => {
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

  it('POST /orders 未登录返回 401', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .post('/api/v1/orders')
      .send({ packId: PAID_PACK_ID })
      .expect(401);
    expect(response.body).toMatchObject({ code: 'SESSION_MISSING' });
  });

  it('建单 → mock 回调 → 订单 paid 且写入 pack_access', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);
    const notify = await simulatePaymentNotify(server, {
      orderId: order.orderId,
      amountCents: order.amountCents,
      token: login.token,
      notificationId: 'notify-001',
      transactionId: 'txn-001',
    });
    expect(notify.processed).toBe(true);
    expect(notify.status).toBe('paid');

    const detail = await request(server)
      .get(`/api/v1/orders/${order.orderId}`)
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);
    const detailBody = orderDetailResponseSchema.parse(detail.body);
    expect(detailBody.status).toBe('paid');
    expect(detailBody.paidAt).toBeDefined();

    const accessCount = await prisma.packAccess.count({
      where: { userId: login.userId, packId: PAID_PACK_ID },
    });
    expect(accessCount).toBe(1);

    const accessResponse = await request(server)
      .get('/api/v1/me/pack-access')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);
    const accessBody = listMyPackAccessResponseSchema.parse(accessResponse.body);
    expect(accessBody.items.some((item) => item.packId === PAID_PACK_ID)).toBe(true);
  });

  it('同一 notification 两次幂等，pack_access 仍 1 条', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);
    const first = await simulatePaymentNotify(server, {
      orderId: order.orderId,
      amountCents: order.amountCents,
      token: login.token,
      notificationId: 'notify-dup',
      transactionId: 'txn-dup',
    });
    expect(first.processed).toBe(true);

    const second = await simulatePaymentNotify(server, {
      orderId: order.orderId,
      amountCents: order.amountCents,
      token: login.token,
      notificationId: 'notify-dup',
      transactionId: 'txn-dup',
    });
    expect(second.processed).toBe(false);
    expect(second.status).toBe('paid');

    const accessCount = await prisma.packAccess.count({
      where: { userId: login.userId, packId: PAID_PACK_ID },
    });
    expect(accessCount).toBe(1);

    const eventCount = await prisma.paymentEvent.count({
      where: { notificationId: 'notify-dup' },
    });
    expect(eventCount).toBe(1);
  });

  it('金额不符拒绝，订单与 pack_access 不变', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);

    const response = await request(server)
      .post('/api/v1/payment/test/simulate-notify')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        orderId: order.orderId,
        notificationId: 'notify-bad-amount',
        transactionId: 'txn-bad-amount',
        amountCents: 1,
      })
      .expect(400);
    expect(response.body).toMatchObject({ code: 'PAYMENT_AMOUNT_MISMATCH' });

    const stored = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(stored?.status).toBe('pending');

    const accessCount = await prisma.packAccess.count({
      where: { userId: login.userId, packId: PAID_PACK_ID },
    });
    expect(accessCount).toBe(0);
  });

  it('省略 amountCents 返回 400', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);

    const response = await request(server)
      .post('/api/v1/payment/test/simulate-notify')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        orderId: order.orderId,
        notificationId: 'notify-missing-amount',
        transactionId: 'txn-missing-amount',
      })
      .expect(400);
    expect(response.body).toMatchObject({ code: 'PAYMENT_AMOUNT_MISSING' });

    const stored = await prisma.order.findUnique({ where: { id: order.orderId } });
    expect(stored?.status).toBe('pending');
  });

  it('未知订单号拒绝', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    const response = await request(server)
      .post('/api/v1/payment/test/simulate-notify')
      .set('X-Mock-Payment-Secret', MOCK_NOTIFY_SECRET)
      .send({
        orderId: '550e8400-e29b-41d4-a716-446655440000',
        amountCents: 1990,
        notificationId: 'notify-unknown',
        transactionId: 'txn-unknown',
      })
      .expect(403);
    expect(response.body).toMatchObject({ code: 'MOCK_PAYMENT_UNAUTHORIZED' });
  });

  it('相同 notification_id 不同 transaction_id 返回 409', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);
    await simulatePaymentNotify(server, {
      orderId: order.orderId,
      amountCents: order.amountCents,
      token: login.token,
      notificationId: 'notify-conflict',
      transactionId: 'txn-a',
    });

    const response = await request(server)
      .post('/api/v1/payment/test/simulate-notify')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        orderId: order.orderId,
        amountCents: order.amountCents,
        notificationId: 'notify-conflict',
        transactionId: 'txn-b',
      })
      .expect(409);
    expect(response.body).toMatchObject({ code: 'PAYMENT_NOTIFICATION_CONFLICT' });
  });

  it('已有 pack_access 时建单返回 409', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, TEST_PHONE, DEVICE_A);

    const order = await createPendingOrder(server, login.token, PAID_PACK_ID);
    await simulatePaymentNotify(server, {
      orderId: order.orderId,
      amountCents: order.amountCents,
      token: login.token,
      notificationId: 'notify-owned',
      transactionId: 'txn-owned',
    });

    const response = await request(server)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${login.token}`)
      .send({ packId: PAID_PACK_ID })
      .expect(409);
    expect(response.body).toMatchObject({ code: 'PACK_ALREADY_OWNED' });
  });
});

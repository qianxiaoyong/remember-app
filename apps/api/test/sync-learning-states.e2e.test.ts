import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { syncBatchUploadResponseSchema, syncSnapshotResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { createIntegrationPrismaClient, resetAuthTables } from './helpers/db-test-helper.js';
import {
  DEVICE_A,
  DEVICE_B,
  KNOWLEDGE_ID,
  requireDatabaseUrl,
  samplePayload,
  sendSmsCode,
  TEST_PHONE,
  verifySmsLogin,
} from './helpers/sync-test-helper.js';

describe('sync learning states integration', () => {
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

  it('批量上传后 snapshot 一致', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    const uploadResponse = await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-1',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 1,
            payload: samplePayload,
          },
        ],
      })
      .expect(200);

    const uploadBody = syncBatchUploadResponseSchema.parse(uploadResponse.body);
    expect(uploadBody).toEqual({
      acceptedEventIds: ['sync-event-1'],
      rejected: [],
    });

    const snapshotResponse = await request(server)
      .get('/api/v1/sync/learning-states/snapshot')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);

    const snapshotBody = syncSnapshotResponseSchema.parse(snapshotResponse.body);
    expect(snapshotBody.items).toHaveLength(1);
    expect(snapshotBody.items[0]).toMatchObject({
      knowledgeId: KNOWLEDGE_ID,
      clientVersion: 1,
      firstAddedFromPackId: samplePayload.firstAddedFromPackId,
    });
  });

  it('重复 eventId 幂等', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    const body = {
      items: [
        {
          eventId: 'sync-event-dup',
          knowledgeId: KNOWLEDGE_ID,
          clientVersion: 1,
          payload: samplePayload,
        },
      ],
    };

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send(body)
      .expect(200);

    const second = await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send(body)
      .expect(200);

    const secondBody = syncBatchUploadResponseSchema.parse(second.body);
    expect(secondBody.acceptedEventIds).toEqual(['sync-event-dup']);

    const rows = await prisma.learningState.findMany({ where: { userId: login.userId } });
    expect(rows).toHaveLength(1);
  });

  it('乱序旧 clientVersion 不覆盖新状态', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-new',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 2,
            payload: { ...samplePayload, legacyRepetitions: 2 },
          },
        ],
      })
      .expect(200);

    const stale = await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-old',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 1,
            payload: samplePayload,
          },
        ],
      })
      .expect(200);

    const staleBody = syncBatchUploadResponseSchema.parse(stale.body);
    expect(staleBody.rejected).toEqual([{ eventId: 'sync-event-old', reason: 'STALE_VERSION' }]);

    const row = await prisma.learningState.findUnique({
      where: {
        userId_knowledgeId: { userId: login.userId, knowledgeId: KNOWLEDGE_ID },
      },
    });
    expect(row?.clientVersion).toBe(2);
    expect(row?.repetitions).toBe(2);
  });

  it('并发 batch 上传时较高 clientVersion 胜出', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await Promise.all([
      request(server)
        .post('/api/v1/sync/learning-states/batch')
        .set('Authorization', `Bearer ${login.token}`)
        .send({
          items: [
            {
              eventId: 'sync-event-concurrent-old',
              knowledgeId: KNOWLEDGE_ID,
              clientVersion: 2,
              payload: { ...samplePayload, legacyRepetitions: 2 },
            },
          ],
        }),
      request(server)
        .post('/api/v1/sync/learning-states/batch')
        .set('Authorization', `Bearer ${login.token}`)
        .send({
          items: [
            {
              eventId: 'sync-event-concurrent-new',
              knowledgeId: KNOWLEDGE_ID,
              clientVersion: 3,
              payload: { ...samplePayload, legacyRepetitions: 3 },
            },
          ],
        }),
    ]);

    const row = await prisma.learningState.findUnique({
      where: {
        userId_knowledgeId: { userId: login.userId, knowledgeId: KNOWLEDGE_ID },
      },
    });
    expect(row?.clientVersion).toBe(3);
    expect(row?.repetitions).toBe(3);
  });

  it('A 上传后 B 登录可读取同一用户 snapshot', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const deviceALogin = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${deviceALogin.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-device-a',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 4,
            payload: { ...samplePayload, legacyRepetitions: 4 },
          },
        ],
      })
      .expect(200);

    await sendSmsCode(server, TEST_PHONE);
    const deviceBLogin = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_B });

    const snapshotResponse = await request(server)
      .get('/api/v1/sync/learning-states/snapshot')
      .set('Authorization', `Bearer ${deviceBLogin.token}`)
      .expect(200);

    const snapshotBody = syncSnapshotResponseSchema.parse(snapshotResponse.body);
    expect(snapshotBody.items).toHaveLength(1);
    expect(snapshotBody.items[0]).toMatchObject({
      knowledgeId: KNOWLEDGE_ID,
      clientVersion: 4,
    });
  });

  it('非主设备 batch 上传返回 403', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const deviceALogin = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await prisma.user.update({
      where: { id: deviceALogin.userId },
      data: { mainDeviceId: DEVICE_B },
    });

    const response = await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${deviceALogin.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-blocked',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 1,
            payload: samplePayload,
          },
        ],
      })
      .expect(403);

    expect(response.body).toMatchObject({ code: 'NOT_MAIN_DEVICE' });
  });

  it('同 clientVersion 冲突时 conservative merge boxLevel 取较小值', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-base',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 5,
            payload: { ...samplePayload, boxLevel: 2 },
          },
        ],
      })
      .expect(200);

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-same-version',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 5,
            payload: { ...samplePayload, boxLevel: 1, updatedAt: '2026-07-30T01:00:00.000Z' },
          },
        ],
      })
      .expect(200);

    const row = await prisma.learningState.findUnique({
      where: {
        userId_knowledgeId: { userId: login.userId, knowledgeId: KNOWLEDGE_ID },
      },
    });
    expect(row?.clientVersion).toBe(5);
    expect(row?.boxLevel).toBe(1);
  });

  it('较高 clientVersion 的 inReviewPool=false 覆盖较低版本 true', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await sendSmsCode(server, TEST_PHONE);
    const login = await verifySmsLogin(server, { phone: TEST_PHONE, deviceId: DEVICE_A });

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-pool-true',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 5,
            payload: { ...samplePayload, inReviewPool: true },
          },
        ],
      })
      .expect(200);

    await request(server)
      .post('/api/v1/sync/learning-states/batch')
      .set('Authorization', `Bearer ${login.token}`)
      .send({
        items: [
          {
            eventId: 'sync-event-pool-false',
            knowledgeId: KNOWLEDGE_ID,
            clientVersion: 6,
            payload: {
              ...samplePayload,
              inReviewPool: false,
              updatedAt: '2026-07-30T02:00:00.000Z',
            },
          },
        ],
      })
      .expect(200);

    const row = await prisma.learningState.findUnique({
      where: {
        userId_knowledgeId: { userId: login.userId, knowledgeId: KNOWLEDGE_ID },
      },
    });
    expect(row?.clientVersion).toBe(6);
    expect(row?.inReviewPool).toBe(false);
  });
});

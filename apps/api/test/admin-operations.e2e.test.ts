import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { adminLoginResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { hashAdminPassword } from '../src/admin-auth/admin-password.js';
import { AppModule } from '../src/app.module.js';
import {
  createIntegrationPrismaClient,
  resetAuthTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = 'integration-admin-password';
const TEST_PHONE = '13800138000';
const DEVICE_A = '11111111-1111-4111-8111-111111111111';

async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  const passwordHash = await hashAdminPassword(ADMIN_PASSWORD);
  await prisma.adminUser.upsert({
    where: { loginName: ADMIN_LOGIN },
    create: { loginName: ADMIN_LOGIN, passwordHash },
    update: { passwordHash, status: 'active' },
  });
}

async function adminLogin(
  server: Parameters<typeof request>[0],
): Promise<{ token: string; adminUserId: string }> {
  const response = await request(server)
    .post('/api/v1/admin/auth/login')
    .send({ loginName: ADMIN_LOGIN, password: ADMIN_PASSWORD })
    .expect(200);
  const body = adminLoginResponseSchema.parse(response.body);
  return { token: body.token, adminUserId: body.admin.adminUserId };
}

describe('admin operations integration', () => {
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

  it('驾驶舱 summary 可返回 KPI', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/dashboard/summary?range=7d')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(response.body.publishedPackCount).toBeGreaterThan(0);
    expect(response.body.range).toBe('7d');
  });

  it('补发 pack_access 写入 audit_logs', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
    const login = await request(server)
      .post('/api/v1/auth/sms/verify')
      .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
      .expect(200);

    const userId = login.body.user.userId as string;

    await request(server)
      .post('/api/v1/admin/pack-access/grant')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId, packId: 'remember-test-pack', note: 'integration grant' })
      .expect(200);

    const audits = await prisma.auditLog.findMany({
      where: { action: 'pack_access.grant' },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]?.result).toBe('success');
  });

  it('mock 退款推进订单状态并写 audit', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
    const login = await request(server)
      .post('/api/v1/auth/sms/verify')
      .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
      .expect(200);
    const userId = login.body.user.userId as string;

    const order = await prisma.order.create({
      data: {
        userId,
        packId: 'remember-test-pack',
        amountCents: 100,
        status: 'paid',
        channel: 'wechat',
      },
    });

    const response = await request(server)
      .post('/api/v1/admin/refunds')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ orderId: order.id, reason: 'integration refund' })
      .expect(200);

    expect(response.body.orderStatus).toBe('refunded');

    const audits = await prisma.auditLog.findMany({ where: { action: 'refund.create' } });
    expect(audits.some((row) => row.result === 'success')).toBe(true);
  });

  it('兑换码批次创建返回明文码', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    const response = await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 2, maxRedemptions: 5 })
      .expect(200);

    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0]?.code).toMatch(/^REDEEM-/);

    const listResponse = await request(server)
      .get('/api/v1/admin/redemption-codes')
      .set('Authorization', `Bearer ${admin.token}`)
      .query({ packId: 'remember-test-pack', page: 1, pageSize: 20 })
      .expect(200);

    const listedCodes = listResponse.body.items
      .map((item: { code?: string }) => item.code)
      .filter(Boolean);
    expect(listedCodes).toContain(response.body.items[0]?.code);
  });

  it('兑换码可更新、软删除、恢复，删除后用户不可兑换', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    const batch = await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 1, maxRedemptions: 3, prefix: 'OPS' })
      .expect(200);

    const codeId = batch.body.items[0]?.id as string;
    const plaintextCode = batch.body.items[0]?.code as string;

    await request(server)
      .patch(`/api/v1/admin/redemption-codes/${codeId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ maxRedemptions: 5, note: 'integration test', status: 'disabled' })
      .expect(200);

    await request(server)
      .patch(`/api/v1/admin/redemption-codes/${codeId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'active' })
      .expect(200);

    await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
    const login = await request(server)
      .post('/api/v1/auth/sms/verify')
      .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
      .expect(200);
    const userToken = login.body.token as string;

    await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 1, maxRedemptions: 1, prefix: 'DEL' })
      .expect(200);
    const deleteTarget = await request(server)
      .get('/api/v1/admin/redemption-codes')
      .set('Authorization', `Bearer ${admin.token}`)
      .query({ packId: 'remember-test-pack', keyword: 'DEL', page: 1, pageSize: 5 })
      .expect(200);
    const deleteId = deleteTarget.body.items[0]?.id as string;
    const deleteCode = deleteTarget.body.items[0]?.code as string;

    await request(server)
      .post(`/api/v1/admin/redemption-codes/${deleteId}/delete`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: deleteCode })
      .expect(404);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ code: plaintextCode })
      .expect(200);

    await request(server)
      .post(`/api/v1/admin/redemption-codes/${deleteId}/restore`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const audits = await prisma.auditLog.findMany({
      where: { action: { startsWith: 'redemption_code.' } },
    });
    expect(audits.some((row) => row.action === 'redemption_code.delete')).toBe(true);
    expect(audits.some((row) => row.action === 'redemption_code.restore')).toBe(true);
  });

  it('上传合法 zip 创建 draft 版本', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);
    await prisma.packVersion.deleteMany({
      where: { packId: 'remember-test-pack', packVersion: '1.0.0' },
    });
    const zipPath = join(
      process.cwd(),
      '..',
      '..',
      'tools',
      'pack-builder',
      'fixtures',
      'remember-test-pack.zip',
    );
    const zipBuffer = readFileSync(zipPath);

    const response = await request(server)
      .post('/api/v1/admin/packs/remember-test-pack/versions')
      .set('Authorization', `Bearer ${admin.token}`)
      .attach('file', zipBuffer, 'remember-test-pack.zip')
      .expect(200);

    expect(response.body.version.packId).toBe('remember-test-pack');
    expect(response.body.manifestSummary.cardCount).toBeGreaterThan(0);

    const audits = await prisma.auditLog.findMany({ where: { action: 'pack_version.upload' } });
    expect(audits).toHaveLength(1);

    const versionId = response.body.version.id as string;
    const noteResponse = await request(server)
      .patch(`/api/v1/admin/packs/remember-test-pack/versions/${versionId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ note: '修复例句音频' })
      .expect(200);

    expect(noteResponse.body.note).toBe('修复例句音频');

    const detail = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(
      detail.body.versions.find((row: { id: string }) => row.id === versionId)?.note,
    ).toBe('修复例句音频');
  });

  it('App session 无法访问 admin dashboard', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
    const login = await request(server)
      .post('/api/v1/auth/sms/verify')
      .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
      .expect(200);

    await request(server)
      .get('/api/v1/admin/dashboard/summary')
      .set('Authorization', `Bearer ${login.body.token as string}`)
      .expect(401);
  });

  it('PATCH pack 元数据字段 round-trip', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const admin = await adminLogin(server);

    await request(server)
      .patch('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        contentTags: ['词汇', '上册'],
        coverUrl: 'https://cdn.example.com/cover.jpg',
        coverBadge: 'TEST',
        coverLines: ['测试包', '第一册'],
        includedHighlights: [{ title: '核心词汇', description: '单词与释义' }],
      })
      .expect(200);

    const detail = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(detail.body.pack.contentTags).toEqual(['词汇', '上册']);
    expect(detail.body.pack.coverBadge).toBe('TEST');
    expect(detail.body.pack.includedHighlights).toHaveLength(1);

    const catalogDetail = await request(server)
      .get('/api/v1/catalog/packs/remember-test-pack')
      .expect(200);

    expect(catalogDetail.body.includedHighlights?.[0]?.title).toBe('核心词汇');
    expect(catalogDetail.body.contentTags).toEqual(['词汇', '上册']);
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import {
  adminCreateRedemptionBatchResponseSchema,
  adminCreateRefundResponseSchema,
  adminDashboardSummarySchema,
  adminPackDetailResponseSchema,
  adminPackVersionSchema,
  adminContentTagVocabularyListResponseSchema,
  adminRedemptionCodeListResponseSchema,
  adminUploadPackVersionResponseSchema,
  adminUserDetailSchema,
  adminUserListResponseSchema,
  catalogPackDetailSchema,
} from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import {
  adminLogin,
  appUserLogin,
  DEVICE_A,
  type HttpServer,
  seedAdminUser,
} from './helpers/admin-test-helper.js';
import {
  createIntegrationPrismaClient,
  resetAuthTables,
  seedCatalogFixtures,
} from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

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
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/dashboard/summary?range=7d')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const body = adminDashboardSummarySchema.parse(response.body);
    expect(body.publishedPackCount).toBeGreaterThan(0);
    expect(body.range).toBe('7d');
  });

  it('补发 pack_access 写入 audit_logs', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);
    const appUser = await appUserLogin(server);

    await request(server)
      .post('/api/v1/admin/pack-access/grant')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: appUser.userId, packId: 'remember-test-pack', note: 'integration grant' })
      .expect(200);

    const audits = await prisma.auditLog.findMany({
      where: { action: 'pack_access.grant' },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]?.result).toBe('success');
  });

  it('mock 退款推进订单状态并写 audit', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);
    const appUser = await appUserLogin(server);

    const order = await prisma.order.create({
      data: {
        userId: appUser.userId,
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

    const body = adminCreateRefundResponseSchema.parse(response.body);
    expect(body.orderStatus).toBe('refunded');

    const audits = await prisma.auditLog.findMany({ where: { action: 'refund.create' } });
    expect(audits.some((row) => row.result === 'success')).toBe(true);
  });

  it('兑换码批次创建返回明文码', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const response = await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 2, maxRedemptions: 5 })
      .expect(200);

    const batch = adminCreateRedemptionBatchResponseSchema.parse(response.body);
    expect(batch.items).toHaveLength(2);
    expect(batch.items[0]?.code).toMatch(/^REDEEM-/);

    const listResponse = await request(server)
      .get('/api/v1/admin/redemption-codes')
      .set('Authorization', `Bearer ${admin.token}`)
      .query({ packId: 'remember-test-pack', page: 1, pageSize: 20 })
      .expect(200);

    const listed = adminRedemptionCodeListResponseSchema.parse(listResponse.body);
    const listedCodes = listed.items
      .map((item) => item.code)
      .filter((code): code is string => Boolean(code));
    expect(listedCodes).toContain(batch.items[0]?.code);
  });

  it('兑换码可更新、软删除、恢复，删除后用户不可兑换', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const batchResponse = await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 1, maxRedemptions: 3, prefix: 'OPS' })
      .expect(200);

    const batch = adminCreateRedemptionBatchResponseSchema.parse(batchResponse.body);
    const codeId = batch.items[0]?.id;
    const plaintextCode = batch.items[0]?.code;
    if (!codeId || !plaintextCode) {
      throw new Error('expected batch item');
    }

    await request(server)
      .patch(`/api/v1/admin/redemption-codes/${encodeURIComponent(codeId)}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ maxRedemptions: 5, note: 'integration test', status: 'disabled' })
      .expect(200);

    await request(server)
      .patch(`/api/v1/admin/redemption-codes/${encodeURIComponent(codeId)}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'active' })
      .expect(200);

    const appUser = await appUserLogin(server);

    await request(server)
      .post('/api/v1/admin/redemption-codes/batch')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ packId: 'remember-test-pack', count: 1, maxRedemptions: 1, prefix: 'DEL' })
      .expect(200);

    const deleteTargetResponse = await request(server)
      .get('/api/v1/admin/redemption-codes')
      .set('Authorization', `Bearer ${admin.token}`)
      .query({ packId: 'remember-test-pack', keyword: 'DEL', page: 1, pageSize: 5 })
      .expect(200);

    const deleteTarget = adminRedemptionCodeListResponseSchema.parse(deleteTargetResponse.body);
    const deleteId = deleteTarget.items[0]?.id;
    const deleteCode = deleteTarget.items[0]?.code;
    if (!deleteId || !deleteCode) {
      throw new Error('expected delete target');
    }

    await request(server)
      .post(`/api/v1/admin/redemption-codes/${encodeURIComponent(deleteId)}/delete`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${appUser.token}`)
      .send({ code: deleteCode })
      .expect(404);

    await request(server)
      .post('/api/v1/redemption/redeem')
      .set('Authorization', `Bearer ${appUser.token}`)
      .send({ code: plaintextCode })
      .expect(200);

    await request(server)
      .post(`/api/v1/admin/redemption-codes/${encodeURIComponent(deleteId)}/restore`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const audits = await prisma.auditLog.findMany({
      where: { action: { startsWith: 'redemption_code.' } },
    });
    expect(audits.some((row) => row.action === 'redemption_code.delete')).toBe(true);
    expect(audits.some((row) => row.action === 'redemption_code.restore')).toBe(true);
  });

  it('上传合法 zip 创建 draft 版本', async () => {
    const server = app.getHttpServer() as HttpServer;
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

    const upload = adminUploadPackVersionResponseSchema.parse(response.body);
    expect(upload.version.packId).toBe('remember-test-pack');
    expect(upload.manifestSummary.cardCount).toBeGreaterThan(0);

    const audits = await prisma.auditLog.findMany({ where: { action: 'pack_version.upload' } });
    expect(audits).toHaveLength(1);

    const versionId = upload.version.id;
    const noteResponse = await request(server)
      .patch(`/api/v1/admin/packs/remember-test-pack/versions/${versionId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ note: '修复例句音频' })
      .expect(200);

    const notedVersion = adminPackVersionSchema.parse(noteResponse.body);
    expect(notedVersion.note).toBe('修复例句音频');

    const detailResponse = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const detail = adminPackDetailResponseSchema.parse(detailResponse.body);
    expect(detail.versions.find((row) => row.id === versionId)?.note).toBe('修复例句音频');
  });

  it('Admin users 列表与详情不返回 phoneHash', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);
    const appUser = await appUserLogin(server);

    await prisma.order.create({
      data: {
        userId: appUser.userId,
        packId: 'remember-test-pack',
        amountCents: 100,
        status: 'paid',
        channel: 'wechat',
      },
    });

    await request(server)
      .post('/api/v1/admin/pack-access/grant')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: appUser.userId, packId: 'remember-test-pack', note: 'users list test' })
      .expect(200);

    const listResponse = await request(server)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`)
      .query({ page: 1, pageSize: 20 })
      .expect(200);

    const listBody = adminUserListResponseSchema.parse(listResponse.body);
    expect(listBody.items.some((row) => row.userId === appUser.userId)).toBe(true);
    const item = listBody.items.find((row) => row.userId === appUser.userId);
    expect(item?.maskedPhone).toMatch(/\*\*\*\*/);
    expect(item?.paidOrderCount).toBeGreaterThanOrEqual(1);
    expect(item?.packAccessCount).toBeGreaterThanOrEqual(1);
    expect(item).not.toHaveProperty('phoneHash');

    const detailResponse = await request(server)
      .get(`/api/v1/admin/users/${appUser.userId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const detail = adminUserDetailSchema.parse(detailResponse.body);
    expect(detail.userId).toBe(appUser.userId);
    expect(detail).not.toHaveProperty('phoneHash');
    expect(detail.mainDeviceId).toBe(DEVICE_A);
  });

  it('App session 无法访问 admin dashboard', async () => {
    const server = app.getHttpServer() as HttpServer;
    const appUser = await appUserLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/dashboard/summary')
      .set('Authorization', `Bearer ${appUser.token}`);

    expect(response.status).toBe(401);
  });

  it('PATCH pack 元数据字段 round-trip', async () => {
    const server = app.getHttpServer() as HttpServer;
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

    const detailResponse = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    const detail = adminPackDetailResponseSchema.parse(detailResponse.body);
    expect(detail.pack.contentTags).toEqual(['词汇', '上册']);
    expect(detail.pack.coverBadge).toBe('TEST');
    expect(detail.pack.includedHighlights).toHaveLength(1);

    const catalogResponse = await request(server)
      .get('/api/v1/catalog/packs/remember-test-pack')
      .expect(200);

    const catalogDetail = catalogPackDetailSchema.parse(catalogResponse.body);
    expect(catalogDetail.includedHighlights?.[0]?.title).toBe('核心词汇');
    expect(catalogDetail.contentTags).toEqual(['词汇', '上册']);
  });

  it('内容标签词库：保存入库、列表可选、删词库不影响 pack', async () => {
    const server = app.getHttpServer() as HttpServer;
    const admin = await adminLogin(server);

    const emptyList = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(adminContentTagVocabularyListResponseSchema.parse(emptyList.body).items).toEqual([]);

    await request(server)
      .patch('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ contentTags: ['英语词汇', '专项'] })
      .expect(200);

    const listAfterSave = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    const labels = adminContentTagVocabularyListResponseSchema
      .parse(listAfterSave.body)
      .items.map((item) => item.label);
    expect(labels).toEqual(expect.arrayContaining(['英语词汇', '专项']));

    await request(server)
      .post('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ labels: ['即时入库'] })
      .expect(204);

    const listAfterUpsert = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(
      adminContentTagVocabularyListResponseSchema
        .parse(listAfterUpsert.body)
        .items.map((item) => item.label),
    ).toEqual(expect.arrayContaining(['即时入库']));

    await request(server)
      .delete('/api/v1/admin/content-tags/' + encodeURIComponent('英语词汇'))
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(204);

    const listAfterDelete = await request(server)
      .get('/api/v1/admin/content-tags')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(
      adminContentTagVocabularyListResponseSchema
        .parse(listAfterDelete.body)
        .items.map((item) => item.label),
    ).toEqual(['专项', '即时入库']);

    const detailResponse = await request(server)
      .get('/api/v1/admin/packs/remember-test-pack')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
    expect(adminPackDetailResponseSchema.parse(detailResponse.body).pack.contentTags).toEqual([
      '英语词汇',
      '专项',
    ]);
  });
});

import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { PrismaClient } from '@prisma/client';
import { verifySmsCodeResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { AuditService } from '../src/audit/audit.service.js';
import { ADMIN_LOGIN, adminLogin, seedAdminUser } from './helpers/admin-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';
import { createIntegrationPrismaClient, resetAuthTables } from './helpers/db-test-helper.js';

const TEST_PHONE = '13800138000';
const DEVICE_A = '11111111-1111-4111-8111-111111111111';

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }
  return databaseUrl;
}

async function appUserLogin(server: Parameters<typeof request>[0]): Promise<string> {
  await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
  const response = await request(server)
    .post('/api/v1/auth/sms/verify')
    .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
    .expect(200);
  return verifySmsCodeResponseSchema.parse(response.body).token;
}

describe('admin auth integration', () => {
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
    await resetAuthTables(prisma);
    await seedAdminUser(prisma);
  });

  it('正确 loginName/password 登录成功，me 返回 admin 信息', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const login = await adminLogin(server);

    expect(login.token.length).toBeGreaterThan(20);

    const meResponse = await request(server)
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);

    expect(meResponse.body).toEqual({
      adminUserId: login.adminUserId,
      loginName: ADMIN_LOGIN,
      role: 'super_admin',
    });
  });

  it('错误密码拒绝', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server)
      .post('/api/v1/admin/auth/login')
      .send({ loginName: ADMIN_LOGIN, password: 'wrong-password-123' })
      .expect(401);

    expect(response.body).toMatchObject({ code: 'ADMIN_CREDENTIALS_INVALID' });
  });

  it('logout 后 token 失效', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const login = await adminLogin(server);

    await request(server)
      .post('/api/v1/admin/auth/logout')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(200);

    const meResponse = await request(server)
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${login.token}`)
      .expect(401);

    expect(meResponse.body).toMatchObject({ code: 'ADMIN_SESSION_INVALID' });
  });

  it('无 token 访问受保护 admin 路由失败', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const response = await request(server).get('/api/v1/admin/auth/me').expect(401);
    expect(response.body).toMatchObject({ code: 'ADMIN_SESSION_MISSING' });
  });

  it('App 用户 token 访问 admin 路由失败', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const appToken = await appUserLogin(server);

    const response = await request(server)
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${appToken}`)
      .expect(401);

    expect(response.body).toMatchObject({ code: 'ADMIN_SESSION_INVALID' });
  });

  it('AuditService.writeAuditLog 写入后 DB 有行', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];
    const login = await adminLogin(server);
    const auditService = app.get(AuditService);

    await auditService.writeAuditLog({
      actorAdminUserId: login.adminUserId,
      action: 'pack_access.grant',
      targetType: 'pack_access',
      targetId: 'remember-test-pack',
      payloadSummary: { packId: 'remember-test-pack', note: 'integration test' },
      result: 'success',
    });

    const rows = await prisma.auditLog.findMany({
      where: { actorAdminUserId: login.adminUserId },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.action).toBe('pack_access.grant');
    expect(rows[0]?.result).toBe('success');
  });
});

import type { PrismaClient } from '@prisma/client';
import { adminLoginResponseSchema, verifySmsCodeResponseSchema } from '@remember/contracts';
import request from 'supertest';
import { hashAdminPassword } from '../../src/admin-auth/admin-password.js';

export const ADMIN_LOGIN = 'admin';
export const ADMIN_PASSWORD = 'integration-admin-password';
export const TEST_PHONE = '13800138000';
export const DEVICE_A = '11111111-1111-4111-8111-111111111111';

export type HttpServer = Parameters<typeof request>[0];

export async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  const passwordHash = await hashAdminPassword(ADMIN_PASSWORD);
  await prisma.adminUser.upsert({
    where: { loginName: ADMIN_LOGIN },
    create: { loginName: ADMIN_LOGIN, passwordHash },
    update: { passwordHash, status: 'active' },
  });
}

export async function adminLogin(
  server: HttpServer,
): Promise<{ token: string; adminUserId: string }> {
  const response = await request(server)
    .post('/api/v1/admin/auth/login')
    .send({ loginName: ADMIN_LOGIN, password: ADMIN_PASSWORD })
    .expect(200);
  const body = adminLoginResponseSchema.parse(response.body);
  return { token: body.token, adminUserId: body.admin.adminUserId };
}

export async function appUserLogin(server: HttpServer): Promise<{ token: string; userId: string }> {
  await request(server).post('/api/v1/auth/sms/send').send({ phone: TEST_PHONE }).expect(200);
  const response = await request(server)
    .post('/api/v1/auth/sms/verify')
    .send({ phone: TEST_PHONE, code: '000000', deviceId: DEVICE_A })
    .expect(200);
  const body = verifySmsCodeResponseSchema.parse(response.body);
  return { token: body.token, userId: body.user.userId };
}

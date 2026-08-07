import { verifySmsCodeResponseSchema } from '@remember/contracts';
import request from 'supertest';

export const TEST_PHONE = '13800138001';
export const DEVICE_A = '11111111-1111-4111-8111-111111111111';
export const DEVICE_B = '22222222-2222-4222-8222-222222222222';
export const KNOWLEDGE_ID = 'remember-test-pack:en:word:hello';

export const samplePayload = {
  inReviewPool: true,
  boxLevel: 0,
  dueAt: '2026-07-30T01:00:00.000Z',
  firstAddedFromPackId: 'remember-test-pack',
  updatedAt: '2026-07-30T00:00:00.000Z',
  legacyEasiness: 2.5,
  legacyIntervalDays: 1,
  legacyRepetitions: 1,
};

export async function sendSmsCode(
  server: Parameters<typeof request>[0],
  phone: string,
): Promise<void> {
  await request(server).post('/api/v1/auth/sms/send').send({ phone }).expect(200);
}

export async function verifySmsLogin(
  server: Parameters<typeof request>[0],
  input: { phone: string; deviceId: string; code?: string },
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

export function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }
  return databaseUrl;
}

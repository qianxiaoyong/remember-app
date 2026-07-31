import { describe, expect, it } from 'vitest';
import { hashAdminPassword, verifyAdminPassword } from './admin-password.js';

describe('admin-password', () => {
  it('哈希后可验证正确密码', async () => {
    const passwordHash = await hashAdminPassword('dev-bootstrap-password');
    expect(await verifyAdminPassword('dev-bootstrap-password', passwordHash)).toBe(true);
    expect(await verifyAdminPassword('wrong-password', passwordHash)).toBe(false);
  });
});

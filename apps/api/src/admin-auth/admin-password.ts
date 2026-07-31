import { hash, verify } from '@node-rs/argon2';

export async function hashAdminPassword(password: string): Promise<string> {
  return hash(password, {
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyAdminPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return verify(passwordHash, password);
}

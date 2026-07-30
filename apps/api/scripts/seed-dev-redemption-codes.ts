import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

function hashRedemptionCode(code: string, pepper: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash('sha256').update(`${normalized}:${pepper}`, 'utf8').digest('hex');
}

const DEV_CODES = [
  { code: 'TEST-REDEEM-001', packId: 'remember-test-pack' },
  { code: 'TEST-REDEEM-GRADE3', packId: 'demo-primary-grade3' },
] as const;

async function main(): Promise<void> {
  const pepper = process.env.REDEMPTION_CODE_PEPPER?.trim();
  if (!pepper) {
    throw new Error('REDEMPTION_CODE_PEPPER must be set (see apps/api/.env.example)');
  }

  const prisma = new PrismaClient();
  try {
    for (const entry of DEV_CODES) {
      const pack = await prisma.pack.findUnique({ where: { packId: entry.packId } });
      if (!pack) {
        console.warn(
          `skip ${entry.code}: pack ${entry.packId} not found — run catalog migration/seed first`,
        );
        continue;
      }

      const codeHash = hashRedemptionCode(entry.code, pepper);
      await prisma.redemptionCode.upsert({
        where: { codeHash },
        create: {
          codeHash,
          packId: entry.packId,
          maxRedemptions: 100,
          redeemedCount: 0,
          status: 'active',
        },
        update: {
          packId: entry.packId,
          status: 'active',
          maxRedemptions: 100,
        },
      });
      console.log(`ok ${entry.code} -> ${entry.packId}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

await main();

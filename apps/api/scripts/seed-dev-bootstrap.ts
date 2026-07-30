import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

function hashRedemptionCode(code: string, pepper: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash('sha256').update(`${normalized}:${pepper}`, 'utf8').digest('hex');
}

const prisma = new PrismaClient();

const DEV_CODES = [
  { code: 'TEST-REDEEM-001', packId: 'remember-test-pack' },
  { code: 'TEST-REDEEM-GRADE3', packId: 'demo-primary-grade3' },
] as const;

const REMEMBER_TEST_PACK_SHA256 =
  '43006107439d77e9c31aa359fda4ca6424185768abe371598c58ba9cda4d978b';
const REMEMBER_TEST_PACK_SIZE_BYTES = 2706;

async function upsertVersion(packId: string, packVersion: string): Promise<void> {
  const row = await prisma.packVersion.upsert({
    where: { packId_packVersion: { packId, packVersion } },
    create: {
      packId,
      packVersion,
      cosObjectKey: `packs/${packId}/${packVersion}/pack.zip`,
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      keyId: 'test-key-1',
      manifestSignature: 'test-signature',
      protocolVersion: 1,
      status: 'published',
      publishedAt: new Date('2026-07-28T00:00:00.000Z'),
    },
    update: {
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      status: 'published',
    },
  });
  await prisma.pack.update({
    where: { packId },
    data: { currentVersionId: row.id },
  });
}

async function main(): Promise<void> {
  const pepper = process.env.REDEMPTION_CODE_PEPPER?.trim();
  if (!pepper) {
    throw new Error('REDEMPTION_CODE_PEPPER must be set');
  }

  for (const packId of ['remember-test-pack', 'demo-primary-grade3'] as const) {
    const exists = await prisma.pack.findUnique({ where: { packId } });
    if (exists) {
      await upsertVersion(packId, '1.0.0');
      console.log(`ok version ${packId} @ 1.0.0`);
    }
  }

  for (const entry of DEV_CODES) {
    const pack = await prisma.pack.findUnique({ where: { packId: entry.packId } });
    if (!pack) {
      console.warn(`skip ${entry.code}: pack missing`);
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
      update: { packId: entry.packId, status: 'active', maxRedemptions: 100 },
    });
    console.log(`ok code ${entry.code}`);
  }
}

await main();
await prisma.$disconnect();

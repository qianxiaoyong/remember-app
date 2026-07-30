import { PrismaClient } from '@prisma/client';
import {
  REMEMBER_TEST_PACK_SHA256,
  REMEMBER_TEST_PACK_SIZE_BYTES,
} from '../src/pack-download/test-pack-fixture.ts';

const prisma = new PrismaClient();

async function upsertVersion(packId: string, packVersion: string): Promise<string> {
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

  return row.id;
}

async function main(): Promise<void> {
  for (const packId of ['remember-test-pack', 'demo-primary-grade3'] as const) {
    const exists = await prisma.pack.findUnique({ where: { packId } });
    if (!exists) {
      console.warn(`skip ${packId}: pack row missing`);
      continue;
    }
    await upsertVersion(packId, '1.0.0');
    console.log(`ok ${packId} @ 1.0.0`);
  }
}

await main();
await prisma.$disconnect();

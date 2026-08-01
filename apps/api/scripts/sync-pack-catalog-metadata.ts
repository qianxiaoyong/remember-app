import { PrismaClient } from '@prisma/client';
import { verifyPackZipBuffer } from '@remember/pack-builder/verify';
import {
  formatPackSizeLabel,
  readSamplePreviewsFromZip,
} from '@remember/pack-builder/catalog-metadata';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readAdminPackConfig } from '../src/config/read-admin-pack-config.js';

const packId = process.argv[2];
const packVersion = process.argv[3] ?? '1.0.0';

if (!packId) {
  console.error('usage: tsx scripts/sync-pack-catalog-metadata.ts <packId> [packVersion]');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const zipPath = join(readAdminPackConfig().storageDir, packId, packVersion, 'pack.zip');
  const zipBytes = new Uint8Array(await readFile(zipPath));
  const verified = await verifyPackZipBuffer(zipBytes);
  const pack = await prisma.pack.findUnique({ where: { packId } });
  if (!pack) {
    throw new Error(`pack not found: ${packId}`);
  }

  const existingPreviews = Array.isArray(pack.samplePreviews) ? pack.samplePreviews : [];
  const samplePreviews =
    existingPreviews.length > 0 ? existingPreviews : readSamplePreviewsFromZip(zipBytes);

  await prisma.pack.update({
    where: { packId },
    data: {
      cardCount: verified.cardCount,
      sizeLabel: formatPackSizeLabel(verified.sizeBytes),
      ...(samplePreviews.length > 0
        ? { samplePreviews: JSON.parse(JSON.stringify(samplePreviews)) }
        : {}),
    },
  });

  console.log(
    `ok ${packId} cardCount=${String(verified.cardCount)} size=${formatPackSizeLabel(verified.sizeBytes)} previews=${String(samplePreviews.length)}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

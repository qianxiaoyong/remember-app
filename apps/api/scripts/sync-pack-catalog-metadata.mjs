import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { verifyPackZipBuffer } from '../../../tools/pack-builder/dist/verify-pack-buffer.js';
import {
  formatPackSizeLabel,
  readSamplePreviewsFromZip,
} from '../../../tools/pack-builder/dist/read-pack-sample-previews.js';

const packId = process.argv[2];
const packVersion = process.argv[3] ?? '1.0.0';

if (!packId) {
  console.error('usage: node scripts/sync-pack-catalog-metadata.mjs <packId> [packVersion]');
  process.exit(1);
}

const storageDir = join(process.cwd(), 'data', 'pack-storage');
const prisma = new PrismaClient();

try {
  const zipPath = join(storageDir, packId, packVersion, 'pack.zip');
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
    `ok ${packId} cardCount=${verified.cardCount} size=${formatPackSizeLabel(verified.sizeBytes)} previews=${samplePreviews.length}`,
  );
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}

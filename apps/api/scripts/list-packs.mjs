import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const packs = await prisma.pack.findMany({
    select: { packId: true, title: true, status: true, updatedAt: true },
    orderBy: { packId: 'asc' },
  });
  const versions = await prisma.packVersion.findMany({
    select: { packId: true, packVersion: true, status: true },
    orderBy: { packId: 'asc' },
  });
  console.log('packs:', JSON.stringify(packs, null, 2));
  console.log('versions:', JSON.stringify(versions, null, 2));
} finally {
  await prisma.$disconnect();
}

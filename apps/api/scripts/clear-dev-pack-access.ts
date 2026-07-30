import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packId = process.argv[2] ?? 'demo-primary-grade3';

const deleted = await prisma.packAccess.deleteMany({ where: { packId } });
console.log(`removed ${deleted.count} pack_access row(s) for ${packId}`);

await prisma.$disconnect();

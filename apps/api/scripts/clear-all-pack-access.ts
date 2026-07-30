import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const before = await prisma.packAccess.count();
await prisma.packAccess.deleteMany();
console.log(`removed ${String(before)} pack_access row(s)`);
await prisma.$disconnect();

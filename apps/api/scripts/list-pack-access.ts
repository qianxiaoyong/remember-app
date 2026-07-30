import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const packId = process.argv[2] ?? 'demo-primary-grade3';

const rows = await prisma.packAccess.findMany({
  where: { packId },
  select: { id: true, userId: true, source: true, grantedAt: true },
});

console.log(`pack_access for ${packId}: ${String(rows.length)} row(s)`);
for (const row of rows) {
  console.log(
    `  userId=${row.userId} source=${row.source} grantedAt=${row.grantedAt.toISOString()}`,
  );
}

await prisma.$disconnect();

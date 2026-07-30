import { PrismaClient } from '@prisma/client';

export function createIntegrationPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export async function resetAuthTables(prisma: PrismaClient): Promise<void> {
  await prisma.syncProcessedEvent.deleteMany();
  await prisma.learningState.deleteMany();
  await prisma.session.deleteMany();
  await prisma.smsChallenge.deleteMany();
  await prisma.user.deleteMany();
}

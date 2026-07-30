import { PrismaClient } from '@prisma/client';
import { resetCommerceTables } from './catalog-test-helper.js';

export function createIntegrationPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export async function resetAuthTables(prisma: PrismaClient): Promise<void> {
  await resetCommerceTables(prisma);
  await prisma.syncProcessedEvent.deleteMany();
  await prisma.learningState.deleteMany();
  await prisma.session.deleteMany();
  await prisma.smsChallenge.deleteMany();
  await prisma.user.deleteMany();
}

export { resetAllIntegrationTables, resetCommerceTables, seedCatalogFixtures } from './catalog-test-helper.js';
export { TEST_REDEMPTION_CODE, TEST_REDEMPTION_PEPPER } from './catalog-test-helper.js';

import { PrismaClient } from '@prisma/client';
import { resetCommerceTables } from './catalog-test-helper.js';

export function createIntegrationPrismaClient(): PrismaClient {
  return new PrismaClient();
}

export async function resetAuthTables(prisma: PrismaClient): Promise<void> {
  await resetAdminTables(prisma);
  await resetCommerceTables(prisma);
  await prisma.syncProcessedEvent.deleteMany();
  await prisma.learningState.deleteMany();
  await prisma.session.deleteMany();
  await prisma.smsChallenge.deleteMany();
  await prisma.user.deleteMany();
}

export async function resetContentLexiconTables(prisma: PrismaClient): Promise<void> {
  await prisma.contentLemmaTagLink.deleteMany();
  await prisma.contentLemmaFragment.deleteMany();
  await prisma.contentLemmaForm.deleteMany();
  await prisma.contentLemmaAsset.deleteMany();
  await prisma.contentLemma.deleteMany();
  await prisma.contentTag.deleteMany();
  await prisma.contentImportBatch.deleteMany();
}

export async function resetAdminTables(prisma: PrismaClient): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.adminSession.deleteMany();
  await prisma.adminUser.deleteMany();
}

export {
  resetAllIntegrationTables,
  resetCommerceTables,
  seedCatalogFixtures,
} from './catalog-test-helper.js';
export { TEST_REDEMPTION_CODE, TEST_REDEMPTION_PEPPER } from './catalog-test-helper.js';

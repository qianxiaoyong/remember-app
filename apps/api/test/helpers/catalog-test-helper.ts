import type { PrismaClient } from '@prisma/client';
import { hashRedemptionCode } from '../../src/redemption/redemption-code-hash.js';
import {
  REMEMBER_TEST_PACK_SHA256,
  REMEMBER_TEST_PACK_SIZE_BYTES,
} from '../../src/pack-download/test-pack-fixture.js';

export const TEST_REDEMPTION_PEPPER = 'integration-test-redemption-pepper';
export const TEST_REDEMPTION_CODE = 'TEST-REDEEM-001';

export async function resetCommerceTables(prisma: PrismaClient): Promise<void> {
  await prisma.redemptionEvent.deleteMany();
  await prisma.redemptionCode.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.paymentEvent.deleteMany();
  await prisma.packAccess.deleteMany();
  await prisma.order.deleteMany();
  await prisma.packVersion.deleteMany();
  await prisma.pack.deleteMany();
}

export async function resetAllIntegrationTables(prisma: PrismaClient): Promise<void> {
  await resetCommerceTables(prisma);
  await prisma.syncProcessedEvent.deleteMany();
  await prisma.learningState.deleteMany();
  await prisma.session.deleteMany();
  await prisma.smsChallenge.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedCatalogFixtures(prisma: PrismaClient): Promise<void> {
  const codeHash = hashRedemptionCode(TEST_REDEMPTION_CODE, TEST_REDEMPTION_PEPPER);

  await prisma.pack.create({
    data: {
      packId: 'remember-test-pack',
      title: '记得测试包',
      primaryCategory: 'junior',
      secondaryCategory: '七年级',
      versionLabel: '人教版',
      contentTags: ['词汇', '上册'],
      cardCount: 2,
      sizeLabel: '约 2 MB',
      summary: '阶段 4 验包与学习闭环用的固定测试知识库。',
      priceCents: 1,
      samplePreviews: [
        {
          headword: 'picture',
          zh: '图片',
          exampleEn: 'I take a picture.',
          initial: 'P',
          previewAudioUrl: 'https://cdn.example.com/samples/picture.mp3',
        },
        {
          headword: 'take a picture',
          zh: '拍照',
          exampleEn: 'Let us take a picture.',
          initial: 'T',
          previewAudioUrl: 'https://cdn.example.com/samples/take-a-picture.mp3',
        },
      ],
      isBundledTestPack: true,
      status: 'published',
      updatedAt: new Date('2026-07-28T00:00:00.000Z'),
    },
  });

  const version = await prisma.packVersion.create({
    data: {
      packId: 'remember-test-pack',
      packVersion: '1.0.0',
      cosObjectKey: 'packs/remember-test-pack/1.0.0/pack.zip',
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      keyId: 'test-key-1',
      manifestSignature: 'test-signature',
      protocolVersion: 1,
      status: 'published',
      publishedAt: new Date('2026-07-28T00:00:00.000Z'),
    },
  });

  await prisma.pack.update({
    where: { packId: 'remember-test-pack' },
    data: { currentVersionId: version.id },
  });

  await prisma.pack.create({
    data: {
      packId: 'demo-primary-grade3',
      title: '三年级上册词汇',
      displayTitle: '人教版三年级上册核心词汇',
      primaryCategory: 'primary',
      secondaryCategory: '三年级',
      versionLabel: '人教版',
      contentTags: ['英语词汇', '人教版', '上册'],
      cardCount: 480,
      sizeLabel: '约 18 MB',
      summary: '覆盖教材核心词汇、常用释义和配套例句。',
      priceCents: 1990,
      coverBadge: 'PEP 3A',
      coverLines: ['三年级上册', '核心词汇'],
      samplePreviews: [
        {
          headword: 'apple',
          zh: '苹果',
          exampleEn: 'I have a red apple.',
          initial: 'A',
        },
      ],
      status: 'published',
      updatedAt: new Date('2026-07-15T00:00:00.000Z'),
    },
  });

  const grade3Version = await prisma.packVersion.create({
    data: {
      packId: 'demo-primary-grade3',
      packVersion: '1.0.0',
      cosObjectKey: 'packs/demo-primary-grade3/1.0.0/pack.zip',
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      keyId: 'test-key-1',
      manifestSignature: 'test-signature',
      protocolVersion: 1,
      status: 'published',
      publishedAt: new Date('2026-07-15T00:00:00.000Z'),
    },
  });

  await prisma.pack.update({
    where: { packId: 'demo-primary-grade3' },
    data: { currentVersionId: grade3Version.id },
  });

  await prisma.redemptionCode.create({
    data: {
      codeHash,
      packId: 'remember-test-pack',
      maxRedemptions: 100,
      redeemedCount: 0,
      status: 'active',
    },
  });

  const grade3CodeHash = hashRedemptionCode('TEST-REDEEM-GRADE3', TEST_REDEMPTION_PEPPER);
  await prisma.redemptionCode.create({
    data: {
      codeHash: grade3CodeHash,
      packId: 'demo-primary-grade3',
      maxRedemptions: 100,
      redeemedCount: 0,
      status: 'active',
    },
  });
}

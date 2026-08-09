import { createHash } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { hashAdminPassword } from '../src/admin-auth/admin-password.ts';
import {
  readAdminAuthConfig,
  readAdminBootstrapPassword,
} from '../src/config/read-admin-auth-config.ts';
import {
  REMEMBER_TEST_PACK_SHA256,
  REMEMBER_TEST_PACK_SIZE_BYTES,
} from '../src/pack-download/test-pack-fixture.ts';

function hashRedemptionCode(code: string, pepper: string): string {
  const normalized = code.trim().toUpperCase();
  return createHash('sha256').update(`${normalized}:${pepper}`, 'utf8').digest('hex');
}

const prisma = new PrismaClient();

const DEV_CODES = [
  { code: 'TEST-REDEEM-001', packId: 'remember-test-pack' },
  { code: 'TEST-REDEEM-GRADE3', packId: 'demo-primary-grade3' },
] as const;

const REMEMBER_TEST_PACK_SAMPLES = [
  {
    headword: 'picture',
    zh: '图片',
    exampleEn: 'I take a picture.',
    initial: 'P',
  },
  {
    headword: 'take a picture',
    zh: '拍照',
    exampleEn: 'Let us take a picture.',
    initial: 'T',
  },
] as const;

async function upsertDevPacks(): Promise<void> {
  await prisma.pack.upsert({
    where: { packId: 'remember-test-pack' },
    create: {
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
      samplePreviews: [...REMEMBER_TEST_PACK_SAMPLES],
      isBundledTestPack: true,
      status: 'published',
      updatedAt: new Date('2026-07-28T00:00:00.000Z'),
    },
    update: {
      status: 'published',
      isBundledTestPack: true,
      samplePreviews: [...REMEMBER_TEST_PACK_SAMPLES],
    },
  });

  await prisma.pack.upsert({
    where: { packId: 'demo-primary-grade3' },
    create: {
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
    update: {
      status: 'published',
    },
  });
}

async function upsertDevContentTagVocabulary(): Promise<void> {
  const packs = await prisma.pack.findMany({ select: { contentTags: true } });
  const labels = new Set<string>();

  for (const pack of packs) {
    if (!Array.isArray(pack.contentTags)) {
      continue;
    }
    for (const tag of pack.contentTags) {
      if (typeof tag === 'string' && tag.trim()) {
        labels.add(tag.trim());
      }
    }
  }

  let sortOrder = 10;
  for (const label of [...labels].sort()) {
    await prisma.contentTagVocabulary.upsert({
      where: { label },
      create: { label, sortOrder },
      update: {},
    });
    sortOrder += 10;
  }
}

async function upsertVersion(packId: string, packVersion: string): Promise<void> {
  const row = await prisma.packVersion.upsert({
    where: { packId_packVersion: { packId, packVersion } },
    create: {
      packId,
      packVersion,
      cosObjectKey: `packs/${packId}/${packVersion}/pack.zip`,
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      keyId: 'test-key-1',
      manifestSignature: 'test-signature',
      protocolVersion: 1,
      status: 'published',
      publishedAt: new Date('2026-07-28T00:00:00.000Z'),
    },
    update: {
      sha256: REMEMBER_TEST_PACK_SHA256,
      sizeBytes: BigInt(REMEMBER_TEST_PACK_SIZE_BYTES),
      status: 'published',
    },
  });
  await prisma.pack.update({
    where: { packId },
    data: { currentVersionId: row.id },
  });
}

async function upsertDevAdminUser(): Promise<void> {
  const bootstrapPassword = readAdminBootstrapPassword();
  if (!bootstrapPassword) {
    console.log('skip admin user (ADMIN_BOOTSTRAP_PASSWORD not set)');
    return;
  }

  const { bootstrapLoginName } = readAdminAuthConfig();
  const passwordHash = await hashAdminPassword(bootstrapPassword);
  await prisma.adminUser.upsert({
    where: { loginName: bootstrapLoginName },
    create: {
      loginName: bootstrapLoginName,
      passwordHash,
    },
    update: {
      passwordHash,
      status: 'active',
    },
  });
  console.log(`ok admin user ${bootstrapLoginName}`);
}

async function main(): Promise<void> {
  const pepper = process.env.REDEMPTION_CODE_PEPPER?.trim();
  if (!pepper) {
    throw new Error('REDEMPTION_CODE_PEPPER must be set');
  }

  await upsertDevPacks();
  console.log('ok dev catalog packs');

  await upsertDevContentTagVocabulary();
  console.log('ok dev content tag vocabulary');

  await upsertDevAdminUser();

  for (const packId of ['remember-test-pack', 'demo-primary-grade3'] as const) {
    await upsertVersion(packId, '1.0.0');
    console.log(`ok version ${packId} @ 1.0.0`);
  }

  for (const entry of DEV_CODES) {
    const codeHash = hashRedemptionCode(entry.code, pepper);
    await prisma.redemptionCode.upsert({
      where: { codeHash },
      create: {
        codeHash,
        code: entry.code,
        packId: entry.packId,
        maxRedemptions: 100,
        redeemedCount: 0,
        status: 'active',
      },
      update: { packId: entry.packId, code: entry.code, status: 'active', maxRedemptions: 100 },
    });
    console.log(`ok code ${entry.code}`);
  }
}

await main();
await prisma.$disconnect();

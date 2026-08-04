import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { importEcdictBatch } from '@remember/lexicon-import/import-ecdict';
import { resetContentLexiconTables } from './helpers/db-test-helper.js';
import { applyIntegrationTestEnv } from './helpers/integration-env.js';

const SAMPLE_CSV = resolve(process.cwd(), '../../tools/lexicon-import/fixtures/ecdict-sample.csv');

describe('ecdict import CLI', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL must be set for integration tests');
    }
    applyIntegrationTestEnv();
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await resetContentLexiconTables(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('导入 sample CSV 并幂等跳过', async () => {
    const first = await importEcdictBatch({
      prisma,
      filePath: SAMPLE_CSV,
      fileVersion: 'sample',
      limit: 10,
    });

    expect(first.alreadyCompleted).toBe(false);
    expect(first.insertedCount).toBe(2);
    expect(first.errorCount).toBe(1);

    const go = await prisma.contentLemma.findUnique({
      where: { lemmaKey: 'go' },
      include: { fragments: true, forms: true, tagLinks: { include: { tag: true } } },
    });
    expect(go?.source).toBe('ecdict');
    expect(go?.status).toBe('draft');
    expect(go?.fragments.some((item) => item.fragmentType === 'definition_zh')).toBe(true);
    expect(go?.forms.some((item) => item.formKey === 'went')).toBe(true);
    expect(go?.tagLinks.some((link) => link.tag.tagKey === 'zk')).toBe(true);

    const second = await importEcdictBatch({
      prisma,
      filePath: SAMPLE_CSV,
      fileVersion: 'sample',
      limit: 10,
    });

    expect(second.alreadyCompleted).toBe(true);
    expect(second.insertedCount).toBe(2);
  });
});

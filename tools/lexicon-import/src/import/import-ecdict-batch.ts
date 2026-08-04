import type { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { mapEcdictRow, type EcdictCsvRow } from '../ecdict/map-ecdict-row.js';
import { readFileSha256 } from './read-file-sha256.js';

export interface ImportEcdictBatchInput {
  prisma: PrismaClient;
  filePath: string;
  fileVersion: string;
  dryRun?: boolean;
  limit?: number;
}

export interface ImportEcdictBatchResult {
  batchId: string | null;
  fileSha256: string;
  insertedCount: number;
  skippedCount: number;
  errorCount: number;
  alreadyCompleted: boolean;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

async function ensureTags(
  prisma: PrismaClient,
  tags: { tagKey: string; labelZh: string }[],
): Promise<Map<string, string>> {
  const tagIdByKey = new Map<string, string>();
  for (const tag of tags) {
    const existing = await prisma.contentTag.findUnique({
      where: { tagKey: tag.tagKey },
      select: { id: true },
    });
    if (existing) {
      tagIdByKey.set(tag.tagKey, existing.id);
      continue;
    }
    const created = await prisma.contentTag.create({
      data: {
        tagKey: tag.tagKey,
        labelZh: tag.labelZh,
      },
      select: { id: true },
    });
    tagIdByKey.set(tag.tagKey, created.id);
  }
  return tagIdByKey;
}

async function insertMappedRow(
  prisma: PrismaClient,
  batchId: string,
  mapped: Extract<ReturnType<typeof mapEcdictRow>, { ok: true }>,
): Promise<'inserted' | 'skipped'> {
  const existing = await prisma.contentLemma.findUnique({
    where: { lemmaKey: mapped.lemmaKey },
    select: { id: true },
  });
  if (existing) {
    return 'skipped';
  }

  const occupiedFormKeys = mapped.forms.length
    ? await prisma.contentLemmaForm.findMany({
        where: { formKey: { in: mapped.forms.map((form) => form.formKey) } },
        select: { formKey: true },
      })
    : [];
  const occupiedSet = new Set(occupiedFormKeys.map((form) => form.formKey));
  const formsToCreate = mapped.forms.filter((form) => !occupiedSet.has(form.formKey));

  const tagIdByKey = await ensureTags(prisma, mapped.tags);
  const tagLinks = mapped.tags
    .map((tag) => tagIdByKey.get(tag.tagKey))
    .filter((tagId): tagId is string => Boolean(tagId))
    .map((tagId) => ({ tagId }));

  await prisma.contentLemma.create({
    data: {
      lemmaKey: mapped.lemmaKey,
      headword: mapped.headword,
      ipa: mapped.ipa ?? null,
      pos: mapped.pos ?? null,
      status: 'draft',
      source: 'ecdict',
      collinsStar: mapped.collinsStar ?? null,
      oxfordCore: mapped.oxfordCore ?? null,
      frequencyBnc: mapped.frequencyBnc ?? null,
      frequencyFrq: mapped.frequencyFrq ?? null,
      importBatchId: batchId,
      fragments: {
        create: mapped.fragments.map((fragment) => ({
          fragmentType: fragment.fragmentType,
          content: fragment.content,
          sortOrder: fragment.sortOrder,
          source: 'ecdict',
        })),
      },
      forms: {
        create: formsToCreate.map((form) => ({
          formKey: form.formKey,
          formType: form.formType,
          displayForm: form.displayForm,
          source: 'ecdict',
        })),
      },
      ...(tagLinks.length > 0 ? { tagLinks: { create: tagLinks } } : {}),
    },
  });

  return 'inserted';
}

interface ProcessImportRowInput {
  prisma: PrismaClient;
  batchId: string;
  record: EcdictCsvRow;
  dryRun: boolean;
}

async function processImportRow(
  input: ProcessImportRowInput,
): Promise<'inserted' | 'skipped' | 'error'> {
  const mapped = mapEcdictRow(input.record);
  if (!mapped.ok) {
    return 'error';
  }
  if (input.dryRun) {
    return 'inserted';
  }
  try {
    return await insertMappedRow(input.prisma, input.batchId, mapped);
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      return 'skipped';
    }
    return 'error';
  }
}

export async function importEcdictBatch(
  input: ImportEcdictBatchInput,
): Promise<ImportEcdictBatchResult> {
  const fileSha256 = await readFileSha256(input.filePath);
  const existingBatch = await input.prisma.contentImportBatch.findUnique({
    where: { fileSha256 },
  });

  if (existingBatch?.status === 'completed') {
    return {
      batchId: existingBatch.id,
      fileSha256,
      insertedCount: existingBatch.insertedCount,
      skippedCount: existingBatch.skippedCount,
      errorCount: existingBatch.errorCount,
      alreadyCompleted: true,
    };
  }

  if (existingBatch && existingBatch.status !== 'failed') {
    throw new Error(
      `导入批次 ${existingBatch.id} 状态为 ${existingBatch.status}，请先处理后再重试`,
    );
  }

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let processed = 0;

  const batch =
    existingBatch ??
    (await input.prisma.contentImportBatch.create({
      data: {
        sourceName: 'ecdict',
        fileVersion: input.fileVersion,
        fileSha256,
        status: 'running',
      },
    }));

  if (existingBatch?.status === 'failed') {
    await input.prisma.contentImportBatch.update({
      where: { id: existingBatch.id },
      data: {
        status: 'running',
        insertedCount: 0,
        skippedCount: 0,
        errorCount: 0,
        errorMessage: null,
        finishedAt: null,
      },
    });
  }

  try {
    const parser = createReadStream(input.filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        relax_column_count: true,
        trim: true,
      }),
    );

    for await (const record of parser) {
      if (input.limit !== undefined && processed >= input.limit) {
        break;
      }
      processed += 1;

      const outcome = await processImportRow({
        prisma: input.prisma,
        batchId: batch.id,
        record: record as EcdictCsvRow,
        dryRun: Boolean(input.dryRun),
      });
      if (outcome === 'inserted') {
        insertedCount += 1;
      } else if (outcome === 'skipped') {
        skippedCount += 1;
      } else {
        errorCount += 1;
      }
    }

    if (!input.dryRun) {
      await input.prisma.contentImportBatch.update({
        where: { id: batch.id },
        data: {
          status: 'completed',
          insertedCount,
          skippedCount,
          errorCount,
          finishedAt: new Date(),
        },
      });
    }

    return {
      batchId: batch.id,
      fileSha256,
      insertedCount,
      skippedCount,
      errorCount,
      alreadyCompleted: false,
    };
  } catch (error: unknown) {
    if (!input.dryRun) {
      const message = error instanceof Error ? error.message : String(error);
      await input.prisma.contentImportBatch.update({
        where: { id: batch.id },
        data: {
          status: 'failed',
          insertedCount,
          skippedCount,
          errorCount,
          errorMessage: message,
          finishedAt: new Date(),
        },
      });
    }
    throw error;
  }
}

/**
 * 从本地 pack-storage（或指定 zip）恢复 PostgreSQL 目录 + 版本记录。
 *
 * 适用：集成测试清库后 zip 仍在磁盘，需重建 packs / pack_versions 行。
 *
 * 用法：
 *   cd apps/api
 *   pnpm restore:pack-from-storage -- en-grade3-v1-rj 1.0.0
 *
 * 可选 catalog（二选一）：
 *   --catalog data/pack-storage/en-grade3-v1-rj/catalog.json
 *   --title "标题" --primary-category primary --secondary-category "三年级" \
 *     --version-label "人教版" --price-cents 100 --summary "简介"
 *
 * 自定义 zip 路径：
 *   --zip D:/path/to/pack.zip
 *
 * 环境：需配置 DATABASE_URL（读 apps/api/.env）
 */
import { readFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { verifyPackZipBuffer } from '@remember/pack-builder/verify';
import {
  formatPackSizeLabel,
  readSamplePreviewsFromZip,
} from '@remember/pack-builder/catalog-metadata';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(scriptDir, '..');

function printUsage() {
  console.error(`usage: node scripts/restore-pack-from-storage.mjs <packId> [packVersion] [options]

options:
  --zip <path>                 指定 zip（默认 data/pack-storage/<packId>/<ver>/pack.zip）
  --catalog <path>             catalog.json（新建目录行时必填，除非库中已有该 packId）
  --title <text>
  --primary-category <id>      primary | junior | senior | postgraduate
  --secondary-category <text>
  --version-label <text>
  --price-cents <number>
  --summary <text>
  --status <draft|published>   默认 published
  --dry-run                    只验包并打印将写入的内容，不写库
`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      flags.dryRun = true;
      continue;
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`missing value for ${arg}`);
      }
      flags[key] = value;
      index += 1;
      continue;
    }
    positional.push(arg);
  }
  return { positional, flags };
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function readStorageDir() {
  const fromEnv = process.env.ADMIN_PACK_STORAGE_DIR?.trim();
  return fromEnv ? fromEnv : join(apiRoot, 'data', 'pack-storage');
}

function resolveZipPath(packId, packVersion, zipFlag, storageDir) {
  if (zipFlag) {
    return isAbsolute(zipFlag) ? zipFlag : resolve(process.cwd(), zipFlag);
  }
  return join(storageDir, packId, packVersion, 'pack.zip');
}

async function loadCatalogJson(path) {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

function buildCatalogDraft(packId, flags, catalogJson, verified, samplePreviews) {
  const title = catalogJson?.title ?? flags.title;
  const primaryCategory = catalogJson?.primaryCategory ?? flags['primary-category'];
  const secondaryCategory = catalogJson?.secondaryCategory ?? flags['secondary-category'];
  const versionLabel = catalogJson?.versionLabel ?? flags['version-label'];
  const summary = catalogJson?.summary ?? flags.summary ?? title;
  const priceCentsRaw = catalogJson?.priceCents ?? flags['price-cents'];
  const priceCents = priceCentsRaw !== undefined ? Number(priceCentsRaw) : undefined;
  const status = catalogJson?.status ?? flags.status ?? 'published';
  const contentTags = Array.isArray(catalogJson?.contentTags) ? catalogJson.contentTags : [];

  if (
    !title ||
    !primaryCategory ||
    !secondaryCategory ||
    !versionLabel ||
    priceCents === undefined ||
    !summary
  ) {
    throw new Error(
      '目录行不存在：请提供 --catalog catalog.json，或补齐 --title/--primary-category/--secondary-category/--version-label/--price-cents/--summary',
    );
  }
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    throw new Error('--price-cents must be a non-negative integer');
  }

  return {
    packId,
    title,
    ...(catalogJson?.displayTitle ? { displayTitle: catalogJson.displayTitle } : {}),
    primaryCategory,
    secondaryCategory,
    versionLabel,
    contentTags,
    cardCount: verified.cardCount,
    sizeLabel: formatPackSizeLabel(verified.sizeBytes),
    summary,
    priceCents,
    samplePreviews,
    isBundledTestPack: catalogJson?.isBundledTestPack === true,
    status,
    ...(catalogJson?.coverUrl ? { coverUrl: catalogJson.coverUrl } : {}),
    ...(catalogJson?.coverBadge ? { coverBadge: catalogJson.coverBadge } : {}),
    ...(Array.isArray(catalogJson?.coverLines) ? { coverLines: catalogJson.coverLines } : {}),
    ...(Array.isArray(catalogJson?.introMedia) ? { introMedia: catalogJson.introMedia } : {}),
  };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const packId = positional[0];
  const packVersionArg = positional[1];

  if (!packId) {
    printUsage();
    process.exit(1);
  }

  const storageDir = readStorageDir();
  const packVersion = packVersionArg ?? '1.0.0';
  const zipPath = resolveZipPath(packId, packVersion, flags.zip, storageDir);

  if (!(await fileExists(zipPath))) {
    throw new Error(`zip not found: ${zipPath}`);
  }

  const zipBytes = new Uint8Array(await readFile(zipPath));
  const verified = await verifyPackZipBuffer(zipBytes);

  if (verified.manifest.packId !== packId) {
    throw new Error(`packId mismatch: arg=${packId} manifest=${verified.manifest.packId}`);
  }
  if (verified.manifest.packVersion !== packVersion) {
    throw new Error(
      `packVersion mismatch: arg=${packVersion} manifest=${verified.manifest.packVersion}`,
    );
  }

  const samplePreviews = readSamplePreviewsFromZip(zipBytes);
  if (samplePreviews.length === 0) {
    throw new Error('zip has no valid sample previews for catalog');
  }

  let catalogJson = null;
  if (flags.catalog) {
    const catalogPath = isAbsolute(flags.catalog)
      ? flags.catalog
      : resolve(process.cwd(), flags.catalog);
    catalogJson = await loadCatalogJson(catalogPath);
  } else {
    const sidecar = join(storageDir, packId, 'catalog.json');
    if (await fileExists(sidecar)) {
      catalogJson = await loadCatalogJson(sidecar);
      console.log(`loaded catalog sidecar: ${sidecar}`);
    }
  }

  const prisma = new PrismaClient();
  try {
    const existingPack = await prisma.pack.findUnique({ where: { packId } });
    const existingVersion = await prisma.packVersion.findUnique({
      where: { packId_packVersion: { packId, packVersion } },
    });

    const catalogDraft = existingPack
      ? null
      : buildCatalogDraft(packId, flags, catalogJson, verified, samplePreviews);

    const versionDraft = {
      packId,
      packVersion: verified.manifest.packVersion,
      cosObjectKey: `packs/${packId}/${verified.manifest.packVersion}/pack.zip`,
      sha256: verified.sha256,
      sizeBytes: BigInt(verified.sizeBytes),
      keyId: verified.manifest.keyId,
      manifestSignature: verified.manifest.signature,
      protocolVersion: verified.manifest.protocolVersion,
      status: 'published',
      publishedAt: new Date(),
    };

    console.log('verify ok');
    console.log(`  zip: ${zipPath}`);
    console.log(
      `  cards: ${String(verified.cardCount)} lexicon: ${String(verified.lexiconEntryCount)}`,
    );
    console.log(`  pack row: ${existingPack ? 'update metadata' : 'create'}`);
    console.log(`  version row: ${existingVersion ? 'update + publish' : 'create + publish'}`);

    if (flags.dryRun) {
      console.log('dry-run: no database changes');
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      let packRow = existingPack;
      if (!packRow) {
        packRow = await tx.pack.create({
          data: {
            ...catalogDraft,
            samplePreviews: JSON.parse(JSON.stringify(catalogDraft.samplePreviews)),
            contentTags: catalogDraft.contentTags,
            ...(catalogDraft.coverLines
              ? { coverLines: JSON.parse(JSON.stringify(catalogDraft.coverLines)) }
              : {}),
            ...(catalogDraft.introMedia
              ? { introMedia: JSON.parse(JSON.stringify(catalogDraft.introMedia)) }
              : {}),
          },
        });
      } else {
        const previews =
          Array.isArray(packRow.samplePreviews) && packRow.samplePreviews.length > 0
            ? packRow.samplePreviews
            : samplePreviews;
        packRow = await tx.pack.update({
          where: { packId },
          data: {
            cardCount: verified.cardCount,
            sizeLabel: formatPackSizeLabel(verified.sizeBytes),
            samplePreviews: JSON.parse(JSON.stringify(previews)),
          },
        });
      }

      const versionRow = existingVersion
        ? await tx.packVersion.update({
            where: { id: existingVersion.id },
            data: {
              cosObjectKey: versionDraft.cosObjectKey,
              sha256: versionDraft.sha256,
              sizeBytes: versionDraft.sizeBytes,
              keyId: versionDraft.keyId,
              manifestSignature: versionDraft.manifestSignature,
              protocolVersion: versionDraft.protocolVersion,
              status: 'published',
              publishedAt: versionDraft.publishedAt,
            },
          })
        : await tx.packVersion.create({ data: versionDraft });

      await tx.pack.update({
        where: { packId },
        data: { currentVersionId: versionRow.id },
      });

      return { packRow, versionRow };
    });

    console.log(
      `ok restored ${packId}@${verified.manifest.packVersion} versionId=${result.versionRow.id}`,
    );
    console.log(
      `  cardCount=${String(result.packRow.cardCount)} size=${result.packRow.sizeLabel} status=${result.packRow.status}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

/**
 * 确保 catalog taxonomy 默认节点存在（幂等）。
 * 迁移已写入 seed 时本脚本可安全重复执行。
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIMARY_NODES = [
  { id: 'a1000001-0000-4000-8000-000000000001', slug: 'primary', label: '小学英语', sortOrder: 1 },
  { id: 'a1000001-0000-4000-8000-000000000002', slug: 'junior', label: '初中英语', sortOrder: 2 },
  { id: 'a1000001-0000-4000-8000-000000000003', slug: 'senior', label: '高中英语', sortOrder: 3 },
  {
    id: 'a1000001-0000-4000-8000-000000000004',
    slug: 'postgraduate',
    label: '考研英语',
    sortOrder: 4,
  },
];

const VERSION_NODES = [
  { id: 'b2000001-0000-4000-8000-000000000001', slug: 'pep', label: '人教版', sortOrder: 1 },
  { id: 'b2000001-0000-4000-8000-000000000002', slug: 'nse', label: '外研版', sortOrder: 2 },
  { id: 'b2000001-0000-4000-8000-000000000003', slug: 'yl', label: '译林版', sortOrder: 3 },
];

const SECONDARY_NODES = [
  {
    id: 'c3000001-0000-4000-8000-000000000101',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade1',
    label: '一年级',
    sortOrder: 1,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000102',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade2',
    label: '二年级',
    sortOrder: 2,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000103',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade3',
    label: '三年级',
    sortOrder: 3,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000104',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade4',
    label: '四年级',
    sortOrder: 4,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000105',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade5',
    label: '五年级',
    sortOrder: 5,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000106',
    primaryId: 'a1000001-0000-4000-8000-000000000001',
    slug: 'grade6',
    label: '六年级',
    sortOrder: 6,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000201',
    primaryId: 'a1000001-0000-4000-8000-000000000002',
    slug: 'grade7',
    label: '七年级',
    sortOrder: 1,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000202',
    primaryId: 'a1000001-0000-4000-8000-000000000002',
    slug: 'grade8',
    label: '八年级',
    sortOrder: 2,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000203',
    primaryId: 'a1000001-0000-4000-8000-000000000002',
    slug: 'grade9',
    label: '九年级',
    sortOrder: 3,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000301',
    primaryId: 'a1000001-0000-4000-8000-000000000003',
    slug: 'grade10',
    label: '高一',
    sortOrder: 1,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000302',
    primaryId: 'a1000001-0000-4000-8000-000000000003',
    slug: 'grade11',
    label: '高二',
    sortOrder: 2,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000303',
    primaryId: 'a1000001-0000-4000-8000-000000000003',
    slug: 'grade12',
    label: '高三',
    sortOrder: 3,
  },
  {
    id: 'c3000001-0000-4000-8000-000000000401',
    primaryId: 'a1000001-0000-4000-8000-000000000004',
    slug: 'postgraduate-en',
    label: '考研英语',
    sortOrder: 1,
  },
];

async function upsertNodes() {
  for (const node of PRIMARY_NODES) {
    await prisma.catalogPrimaryNode.upsert({
      where: { id: node.id },
      create: { ...node, status: 'active' },
      update: { label: node.label, sortOrder: node.sortOrder, status: 'active' },
    });
  }

  for (const node of VERSION_NODES) {
    await prisma.catalogVersionNode.upsert({
      where: { id: node.id },
      create: { ...node, status: 'active' },
      update: { label: node.label, sortOrder: node.sortOrder, status: 'active' },
    });
  }

  for (const node of SECONDARY_NODES) {
    await prisma.catalogSecondaryNode.upsert({
      where: { id: node.id },
      create: { ...node, status: 'active' },
      update: {
        label: node.label,
        sortOrder: node.sortOrder,
        status: 'active',
        primaryId: node.primaryId,
      },
    });
  }
}

async function backfillPackFks() {
  const primaries = await prisma.catalogPrimaryNode.findMany();
  const secondaries = await prisma.catalogSecondaryNode.findMany();
  const versions = await prisma.catalogVersionNode.findMany();

  const primaryBySlug = new Map(primaries.map((node) => [node.slug, node]));
  const versionByLabel = new Map(versions.map((node) => [node.label, node]));

  const packs = await prisma.pack.findMany();
  for (const pack of packs) {
    const primary = primaryBySlug.get(pack.primaryCategory);
    const version = versionByLabel.get(pack.versionLabel);
    const secondary = secondaries.find(
      (node) => node.primaryId === primary?.id && node.label === pack.secondaryCategory,
    );

    if (!primary || !secondary || !version) {
      console.warn(`跳过 pack ${pack.packId}：无法映射 taxonomy`);
      continue;
    }

    await prisma.pack.update({
      where: { packId: pack.packId },
      data: {
        primaryNodeId: primary.id,
        secondaryNodeId: secondary.id,
        versionNodeId: version.id,
      },
    });
  }
}

async function main() {
  await upsertNodes();
  await backfillPackFks();
  console.log('catalog taxonomy seed 完成');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

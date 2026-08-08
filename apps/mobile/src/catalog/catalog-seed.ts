import type { CatalogPackTaxonomy, IncludedHighlight } from '@remember/contracts';
import type { IntroMediaItem } from '@remember/contracts';
import type { PackSamplePreview } from './pack-sample-preview';

export type CatalogPrimaryCategory = 'all' | 'primary' | 'junior' | 'senior' | 'postgraduate';

export interface CatalogPackItem {
  packId: string;
  title: string;
  /** 详情页展示标题；缺省用 title */
  displayTitle?: string;
  primaryCategory: Exclude<CatalogPrimaryCategory, 'all'>;
  secondaryCategory: string;
  version: string;
  contentTags: string[];
  cardCount: number;
  sizeLabel: string;
  updatedAt: string;
  priceCents: number;
  priceLabel: string;
  summary: string;
  sampleHeadwords: string[];
  /** 详情页内容示例；缺省由 sampleHeadwords 占位 */
  samplePreviews?: PackSamplePreview[];
  introMedia?: IntroMediaItem[];
  isBundledTestPack: boolean;
  /** 封面角标，如 PEP 3A；后台目录可配置，App 直接展示 */
  coverBadge?: string;
  /** 封面主文案行（1～3 行）；后台目录可配置，App 直接展示 */
  coverLines?: string[];
  /** 封面图 URL；后台下发 */
  coverUrl?: string;
  /** 封面图本地资源；mock 阶段可用 require */
  coverImage?: number;
  /** 后台 taxonomy 挂载；有则优先用于展示 label */
  taxonomy?: CatalogPackTaxonomy;
  /** 当前发布的内容版本（semver）；来自 catalog API */
  currentPackVersion?: string;
  protocolVersion?: number;
  /** 详情「包含内容」；后台可配置 1～4 条 */
  includedHighlights?: IncludedHighlight[];
}

export const CATALOG_PRIMARY_OPTIONS: { id: CatalogPrimaryCategory; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'primary', label: '小学英语' },
  { id: 'junior', label: '初中英语' },
  { id: 'senior', label: '高中英语' },
  { id: 'postgraduate', label: '考研英语' },
];

export const CATALOG_ALL_VERSION_LABEL = '全部';

export const CATALOG_VERSION_OPTIONS = [
  CATALOG_ALL_VERSION_LABEL,
  '人教版',
  '外研版',
  '译林版',
] as const;

export function listSecondaryCategories(primaryCategory: CatalogPrimaryCategory): string[] {
  if (primaryCategory === 'primary') {
    return ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  }
  if (primaryCategory === 'junior') {
    return ['全部', '七年级', '八年级', '九年级'];
  }
  if (primaryCategory === 'senior') {
    return ['全部', '高一', '高二', '高三'];
  }
  if (primaryCategory === 'postgraduate') {
    return ['全部', '考研英语'];
  }
  return ['全部'];
}

const bundledTestPackBase = {
  title: '记得测试包',
  contentTags: ['词汇', '上册'],
  cardCount: 2,
  sizeLabel: '约 2 MB',
  updatedAt: '2026-07-28',
  priceCents: 1,
  priceLabel: '¥0.01',
  summary: '阶段 4 验包与学习闭环用的固定测试知识库。',
  sampleHeadwords: ['picture', 'take a picture'],
  samplePreviews: [
    {
      headword: 'picture',
      zh: '图片',
      exampleEn: 'I take a picture.',
      initial: 'P',
      previewAudio: 'assets/audio/picture.mp3',
    },
    {
      headword: 'take a picture',
      zh: '拍照',
      exampleEn: 'Let us take a picture.',
      initial: 'T',
      previewAudio: 'assets/audio/take-a-picture.mp3',
    },
  ] satisfies PackSamplePreview[],
  isBundledTestPack: true as const,
};

function bundledTestPackVariant(
  packId: string,
  overrides: Partial<CatalogPackItem> = {},
): CatalogPackItem {
  return {
    packId,
    primaryCategory: 'junior',
    secondaryCategory: '全部',
    version: '人教版',
    ...bundledTestPackBase,
    ...overrides,
  };
}

export const catalogSeed: CatalogPackItem[] = [
  bundledTestPackVariant('remember-test-pack'),
  {
    packId: 'story-test-pack',
    title: 'Story 阅读测试包',
    primaryCategory: 'primary',
    secondaryCategory: '三年级',
    version: '测试',
    contentTags: ['阅读', '童话'],
    cardCount: 1,
    sizeLabel: '约 1 MB',
    updatedAt: '2026-08-02',
    priceCents: 1,
    priceLabel: '¥0.01',
    summary: 'story_reading 注释阅读真机验收用内置包（C1 公主与豌豆）。',
    sampleHeadwords: ['The Princess and the Pea'],
    isBundledTestPack: true,
  },
  bundledTestPackVariant('remember-test-pack-2', { version: '外研版' }),
  bundledTestPackVariant('remember-test-pack-3', { version: '译林版' }),
  bundledTestPackVariant('remember-test-pack-4', {
    secondaryCategory: '七年级',
    contentTags: ['词汇', '下册'],
  }),
  bundledTestPackVariant('remember-test-pack-5', {
    secondaryCategory: '八年级',
    contentTags: ['词汇', '上册'],
  }),
  {
    packId: 'demo-primary-grade1',
    title: '一年级上册词汇',
    primaryCategory: 'primary',
    secondaryCategory: '一年级',
    version: '人教版',
    contentTags: ['词汇', '上册'],
    cardCount: 80,
    sizeLabel: '约 12 MB',
    updatedAt: '2026-07-22',
    priceCents: 900,
    priceLabel: '¥9.00',
    summary: 'mock 目录项，阶段 6 前不可真实购买。',
    sampleHeadwords: ['hello', 'book'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-primary-grade3',
    title: '三年级上册词汇',
    displayTitle: '人教版三年级上册核心词汇',
    primaryCategory: 'primary',
    secondaryCategory: '三年级',
    version: '人教版',
    contentTags: ['英语词汇', '人教版', '上册'],
    cardCount: 480,
    sizeLabel: '约 18 MB',
    updatedAt: '2026-07-15',
    priceCents: 1990,
    priceLabel: '¥19.9',
    summary: '覆盖教材核心词汇、常用释义和配套例句，支持主内容语音与例句点词查询。',
    sampleHeadwords: ['apple', 'family'],
    samplePreviews: [
      {
        headword: 'apple',
        zh: '苹果',
        exampleEn: 'I have a red apple.',
        initial: 'A',
      },
      {
        headword: 'family',
        zh: '家庭',
        exampleEn: 'This is my family.',
        initial: 'F',
      },
    ],
    isBundledTestPack: false,
    coverBadge: 'PEP 3A',
    coverLines: ['三年级上册', '核心词汇'],
  },
  {
    packId: 'demo-primary-grade5',
    title: '五年级下册词汇',
    primaryCategory: 'primary',
    secondaryCategory: '五年级',
    version: '外研版',
    contentTags: ['词汇', '下册'],
    cardCount: 160,
    sizeLabel: '约 22 MB',
    updatedAt: '2026-07-19',
    priceCents: 1400,
    priceLabel: '¥14.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['science', 'museum'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-junior-grade7',
    title: '七年级下册词汇',
    primaryCategory: 'junior',
    secondaryCategory: '七年级',
    version: '外研版',
    contentTags: ['词汇', '下册'],
    cardCount: 240,
    sizeLabel: '约 32 MB',
    updatedAt: '2026-07-18',
    priceCents: 1800,
    priceLabel: '¥18.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['weather', 'library'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-junior-grade8',
    title: '八年级上册词汇',
    primaryCategory: 'junior',
    secondaryCategory: '八年级',
    version: '人教版',
    contentTags: ['词汇', '上册'],
    cardCount: 260,
    sizeLabel: '约 34 MB',
    updatedAt: '2026-07-17',
    priceCents: 1900,
    priceLabel: '¥19.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['invention', 'wheel'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-junior-grade9',
    title: '九年级全册词汇',
    primaryCategory: 'junior',
    secondaryCategory: '九年级',
    version: '译林版',
    contentTags: ['词汇', '全册'],
    cardCount: 320,
    sizeLabel: '约 40 MB',
    updatedAt: '2026-07-16',
    priceCents: 2200,
    priceLabel: '¥22.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['volunteer', 'decision'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-senior-grade10',
    title: '高一必修词汇',
    primaryCategory: 'senior',
    secondaryCategory: '高一',
    version: '人教版',
    contentTags: ['词汇', '必修'],
    cardCount: 400,
    sizeLabel: '约 48 MB',
    updatedAt: '2026-07-15',
    priceCents: 2800,
    priceLabel: '¥28.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['exchange', 'schedule'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-senior-grade11',
    title: '高二选修词汇',
    primaryCategory: 'senior',
    secondaryCategory: '高二',
    version: '外研版',
    contentTags: ['词汇', '选修'],
    cardCount: 380,
    sizeLabel: '约 45 MB',
    updatedAt: '2026-07-14',
    priceCents: 2600,
    priceLabel: '¥26.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['abstract', 'concept'],
    isBundledTestPack: false,
  },
  {
    packId: 'demo-postgraduate-core',
    title: '考研核心词汇',
    primaryCategory: 'postgraduate',
    secondaryCategory: '考研英语',
    version: '人教版',
    contentTags: ['词汇', '核心'],
    cardCount: 550,
    sizeLabel: '约 62 MB',
    updatedAt: '2026-07-13',
    priceCents: 3900,
    priceLabel: '¥39.00',
    summary: 'mock 目录项，用于市场 UI smoke。',
    sampleHeadwords: ['hypothesis', 'phenomenon'],
    isBundledTestPack: false,
  },
];

export function findCatalogItem(packId: string): CatalogPackItem | null {
  return catalogSeed.find((item) => item.packId === packId) ?? null;
}

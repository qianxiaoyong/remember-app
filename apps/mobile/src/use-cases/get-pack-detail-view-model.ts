import { findCatalogItem } from '../catalog/catalog-seed';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import {
  resolveCatalogCover,
  type CatalogCoverPresentation,
} from '../catalog/resolve-catalog-cover';
import { isPackMockPurchased } from '../catalog/mock-purchase-store';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import {
  formatPackSizeLabel,
  formatPackUpdatedAt,
  resolvePackCategoryContext,
  resolvePackDisplayTitle,
  resolvePackIncludedSubtitle,
} from './format-pack-detail-labels';
import { resolvePackSamplePreviews } from './resolve-pack-sample-previews';

export type PackDetailActionKind =
  'purchase' | 'download' | 'install' | 'start_study' | 'continue_study';

export interface PackDetailViewModel {
  packId: string;
  title: string;
  categoryContextLabel: string;
  includedSubtitle: string;
  cover: CatalogCoverPresentation;
  mockPriceLabel: string;
  isMockPrice: true;
  purchaseHint: string;
  summary: string;
  cardCount: number;
  sizeLabel: string;
  formattedUpdatedAt: string;
  contentTags: string[];
  samplePreviews: PackSamplePreview[];
  isInstalled: boolean;
  isMockPurchased: boolean;
  isBundledTestPack: boolean;
  actionKind: PackDetailActionKind;
  actionLabel: string;
}

export async function getPackDetailViewModel(packId: string): Promise<PackDetailViewModel | null> {
  const catalogItem = findCatalogItem(packId);
  if (!catalogItem) {
    return null;
  }

  const installed = getInstalledPack(packId);
  const isInstalled = installed?.installStatus === 'installed';
  const isMockPurchased = await isPackMockPurchased(packId);
  const action = resolveDetailAction(isInstalled, isMockPurchased, catalogItem.isBundledTestPack);

  return {
    packId: catalogItem.packId,
    title: resolvePackDisplayTitle(catalogItem),
    categoryContextLabel: resolvePackCategoryContext(catalogItem),
    includedSubtitle: resolvePackIncludedSubtitle(catalogItem),
    cover: resolveCatalogCover(catalogItem),
    mockPriceLabel: catalogItem.mockPriceLabel,
    isMockPrice: true,
    purchaseHint: '一次购买，兼容更新免费',
    summary: catalogItem.summary,
    cardCount: catalogItem.cardCount,
    sizeLabel: formatPackSizeLabel(catalogItem.sizeLabel),
    formattedUpdatedAt: formatPackUpdatedAt(catalogItem.updatedAt),
    contentTags: catalogItem.contentTags,
    samplePreviews: resolvePackSamplePreviews(catalogItem),
    isInstalled,
    isMockPurchased,
    isBundledTestPack: catalogItem.isBundledTestPack,
    actionKind: action.kind,
    actionLabel: action.label,
  };
}

function resolveDetailAction(
  isInstalled: boolean,
  isMockPurchased: boolean,
  isBundledTestPack: boolean,
): { kind: PackDetailActionKind; label: string } {
  if (isInstalled) {
    return { kind: 'start_study', label: '开始学习' };
  }
  if (isMockPurchased || isBundledTestPack) {
    return { kind: 'install', label: '安装' };
  }
  return { kind: 'purchase', label: '立即购买' };
}

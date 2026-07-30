import { findCatalogItem } from '../catalog/catalog-seed';
import { mapCatalogDetailToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { ApiNetworkError } from '../data/api/api-client';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import {
  resolveCatalogCover,
  type CatalogCoverPresentation,
} from '../catalog/resolve-catalog-cover';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import {
  formatPackSizeLabel,
  formatPackUpdatedAt,
  resolvePackCategoryContext,
  resolvePackDisplayTitle,
  resolvePackIncludedSubtitle,
} from './format-pack-detail-labels';
import { resolvePackSamplePreviews } from './resolve-pack-sample-previews';
import { resolvePackAccess, resolveDetailAction, type PackDetailActionKind } from './resolve-pack-detail-action';
import type { IntroMediaItem } from '@remember/contracts';

export type { PackDetailActionKind };

export interface PackDetailViewModel {
  packId: string;
  title: string;
  categoryContextLabel: string;
  includedSubtitle: string;
  cover: CatalogCoverPresentation;
  priceLabel: string;
  purchaseHint: string;
  summary: string;
  cardCount: number;
  sizeLabel: string;
  formattedUpdatedAt: string;
  contentTags: string[];
  samplePreviews: PackSamplePreview[];
  introMedia: IntroMediaItem[];
  isInstalled: boolean;
  hasPackAccess: boolean;
  packAccessUnavailable: boolean;
  isBundledTestPack: boolean;
  actionKind: PackDetailActionKind;
  actionLabel: string;
}

export async function getPackDetailViewModel(packId: string): Promise<PackDetailViewModel | null> {
  let catalogItem = null;
  try {
    const detail = await fetchCatalogPackDetail(packId);
    catalogItem = mapCatalogDetailToItem(detail);
  } catch (error) {
    if (__DEV__ && error instanceof ApiNetworkError) {
      catalogItem = findCatalogItem(packId);
    } else if (error instanceof ApiNetworkError) {
      return null;
    } else {
      throw error;
    }
  }

  if (!catalogItem) {
    return null;
  }

  const installed = getInstalledPack(packId);
  const isInstalled = installed?.installStatus === 'installed';
  const packAccess = await resolvePackAccess(packId);
  const action = resolveDetailAction({
    isInstalled,
    packAccess,
    isBundledTestPack: catalogItem.isBundledTestPack,
  });

  return {
    packId: catalogItem.packId,
    title: resolvePackDisplayTitle(catalogItem),
    categoryContextLabel: resolvePackCategoryContext(catalogItem),
    includedSubtitle: resolvePackIncludedSubtitle(catalogItem),
    cover: resolveCatalogCover(catalogItem),
    priceLabel: catalogItem.priceLabel,
    purchaseHint: action.packAccessUnavailable
      ? '暂时无法确认购买状态，请检查网络后重试'
      : '一次购买，兼容更新免费',
    summary: catalogItem.summary,
    cardCount: catalogItem.cardCount,
    sizeLabel: formatPackSizeLabel(catalogItem.sizeLabel),
    formattedUpdatedAt: formatPackUpdatedAt(catalogItem.updatedAt),
    contentTags: catalogItem.contentTags,
    samplePreviews: resolvePackSamplePreviews(catalogItem),
    introMedia: catalogItem.introMedia ?? [],
    isInstalled,
    hasPackAccess: action.hasPackAccess,
    packAccessUnavailable: action.packAccessUnavailable,
    isBundledTestPack: catalogItem.isBundledTestPack,
    actionKind: action.actionKind,
    actionLabel: action.actionLabel,
  };
}

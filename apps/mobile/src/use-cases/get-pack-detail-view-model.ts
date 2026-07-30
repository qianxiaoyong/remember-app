import { findCatalogItem } from '../catalog/catalog-seed';
import { mapCatalogDetailToItem } from '../catalog/map-catalog-api';
import { fetchCatalogPackDetail } from '../data/api/catalog-api';
import { fetchMyPackAccess } from '../data/api/pack-access-api';
import { ApiNetworkError } from '../data/api/api-client';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import {
  resolveCatalogCover,
  type CatalogCoverPresentation,
} from '../catalog/resolve-catalog-cover';
import { getInstalledPack } from '../data/repositories/installed-pack-repository';
import { readSessionToken } from '../data/session/session-store';
import {
  formatPackSizeLabel,
  formatPackUpdatedAt,
  resolvePackCategoryContext,
  resolvePackDisplayTitle,
  resolvePackIncludedSubtitle,
} from './format-pack-detail-labels';
import { resolvePackSamplePreviews } from './resolve-pack-sample-previews';
import type { IntroMediaItem } from '@remember/contracts';

export type PackDetailActionKind =
  'purchase' | 'download' | 'install' | 'start_study' | 'continue_study';

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
  isBundledTestPack: boolean;
  actionKind: PackDetailActionKind;
  actionLabel: string;
}

async function resolveHasPackAccess(packId: string): Promise<boolean> {
  const token = await readSessionToken();
  if (!token) {
    return false;
  }
  try {
    const items = await fetchMyPackAccess(token);
    return items.some((item) => item.packId === packId);
  } catch {
    return false;
  }
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
  const hasPackAccess = await resolveHasPackAccess(packId);
  const action = resolveDetailAction(
    isInstalled,
    hasPackAccess,
    catalogItem.isBundledTestPack,
  );

  return {
    packId: catalogItem.packId,
    title: resolvePackDisplayTitle(catalogItem),
    categoryContextLabel: resolvePackCategoryContext(catalogItem),
    includedSubtitle: resolvePackIncludedSubtitle(catalogItem),
    cover: resolveCatalogCover(catalogItem),
    priceLabel: catalogItem.priceLabel,
    purchaseHint: '一次购买，兼容更新免费',
    summary: catalogItem.summary,
    cardCount: catalogItem.cardCount,
    sizeLabel: formatPackSizeLabel(catalogItem.sizeLabel),
    formattedUpdatedAt: formatPackUpdatedAt(catalogItem.updatedAt),
    contentTags: catalogItem.contentTags,
    samplePreviews: resolvePackSamplePreviews(catalogItem),
    introMedia: catalogItem.introMedia ?? [],
    isInstalled,
    hasPackAccess,
    isBundledTestPack: catalogItem.isBundledTestPack,
    actionKind: action.kind,
    actionLabel: action.label,
  };
}

function resolveDetailAction(
  isInstalled: boolean,
  hasPackAccess: boolean,
  isBundledTestPack: boolean,
): { kind: PackDetailActionKind; label: string } {
  if (isInstalled) {
    return { kind: 'start_study', label: '开始学习' };
  }
  if (hasPackAccess || isBundledTestPack) {
    return { kind: 'install', label: '安装' };
  }
  return { kind: 'purchase', label: '立即购买' };
}

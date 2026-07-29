import type { CatalogPackItem } from '../catalog/catalog-seed';
import { CATALOG_PRIMARY_OPTIONS } from '../catalog/catalog-seed';

export function formatPackUpdatedAt(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return isoDate;
  }
  const month = Number(match[2]);
  const day = Number(match[3]);
  return `${month}月${day}日`;
}

export function formatPackSizeLabel(sizeLabel: string): string {
  return sizeLabel.replace(/^约\s*/, '');
}

export function resolvePackCategoryContext(item: CatalogPackItem): string {
  const primaryLabel =
    CATALOG_PRIMARY_OPTIONS.find((option) => option.id === item.primaryCategory)?.label ??
    item.primaryCategory;
  return `${primaryLabel} · ${item.secondaryCategory}`;
}

export function resolvePackIncludedSubtitle(item: CatalogPackItem): string {
  const semesterTag = item.contentTags.find((tag) => /上册|下册|全册/.test(tag));
  let semesterSuffix = '';
  if (semesterTag === '上册') {
    semesterSuffix = '上学期';
  } else if (semesterTag === '下册') {
    semesterSuffix = '下学期';
  } else if (semesterTag === '全册') {
    semesterSuffix = '全学年';
  }
  return `适合${item.secondaryCategory}${semesterSuffix}`;
}

export function resolvePackDisplayTitle(item: CatalogPackItem): string {
  return item.displayTitle ?? item.title;
}

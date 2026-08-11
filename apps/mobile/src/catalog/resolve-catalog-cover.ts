import type { ImageSourcePropType } from 'react-native';
import type { CatalogPackItem } from './catalog-seed';
import { resolveRemoteCoverImageSource } from './catalog-cover-image-source-cache';
import { resolveCatalogCoverImage } from './catalog-cover-images';
import { packCoverPalette } from '../theme/colors';

export interface CatalogCoverPresentation {
  badge: string;
  lines: string[];
  color: string;
  imageSource: ImageSourcePropType;
}

const VERSION_BADGE: Record<string, string> = {
  人教版: 'PEP',
  外研版: 'NSE',
  译林版: 'YL',
};

function resolveCoverColor(packId: string): string {
  let hash = 0;
  for (let index = 0; index < packId.length; index += 1) {
    hash = (hash + packId.charCodeAt(index)) % packCoverPalette.length;
  }
  return packCoverPalette[hash] ?? packCoverPalette[0];
}

function resolveDefaultBadge(item: CatalogPackItem): string {
  if (item.isBundledTestPack) {
    return 'Demo';
  }

  const versionCode = VERSION_BADGE[item.version] ?? item.version.slice(0, 3);
  if (item.secondaryCategory === '全部' || item.secondaryCategory === '考研英语') {
    return versionCode;
  }

  const gradeMatch = /^([一二三四五六])年级$/.exec(item.secondaryCategory);
  if (gradeMatch) {
    const gradeNumberMap: Record<string, string> = {
      一: '1',
      二: '2',
      三: '3',
      四: '4',
      五: '5',
      六: '6',
    };
    const gradeNumber = gradeNumberMap[gradeMatch[1] ?? ''] ?? '?';
    return `${versionCode} ${gradeNumber}`;
  }

  if (item.secondaryCategory.startsWith('高')) {
    return `${versionCode} ${item.secondaryCategory}`;
  }

  if (/^\d/.test(item.secondaryCategory)) {
    return `${versionCode} ${item.secondaryCategory.charAt(0)}`;
  }

  return versionCode;
}

function resolveDefaultLines(item: CatalogPackItem): string[] {
  if (item.isBundledTestPack) {
    return ['记得', '测试包'];
  }

  const semesterTag = item.contentTags.find((tag) => /上册|下册|全册|必修|选修|核心/.test(tag));
  const typeTag = item.contentTags.find((tag) => tag === '词汇') ?? '词汇';

  if (item.secondaryCategory !== '全部' && item.secondaryCategory !== '考研英语') {
    const head = semesterTag ? `${item.secondaryCategory}${semesterTag}` : item.secondaryCategory;
    return [head, typeTag];
  }

  if (item.title.length <= 8) {
    return [item.title];
  }

  const midpoint = Math.ceil(item.title.length / 2);
  return [item.title.slice(0, midpoint), item.title.slice(midpoint)];
}

export function resolveCatalogCover(item: CatalogPackItem): CatalogCoverPresentation {
  const imageSource: ImageSourcePropType = item.coverUrl
    ? resolveRemoteCoverImageSource(item.coverUrl)
    : (item.coverImage ?? resolveCatalogCoverImage(item.packId));

  return {
    badge: item.coverBadge ?? resolveDefaultBadge(item),
    lines: item.coverLines ?? resolveDefaultLines(item),
    color: resolveCoverColor(item.packId),
    imageSource,
  };
}

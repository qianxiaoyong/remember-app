import cover1 from '../../assets/images/catalog-covers/cover-1.png';
import cover2 from '../../assets/images/catalog-covers/cover-2.png';
import cover3 from '../../assets/images/catalog-covers/cover-3.png';
import cover4 from '../../assets/images/catalog-covers/cover-4.png';
import cover5 from '../../assets/images/catalog-covers/cover-5.png';

export const CATALOG_COVER_IMAGES = [cover1, cover2, cover3, cover4, cover5] as const;

export function resolveCatalogCoverImage(packId: string): number {
  let hash = 0;
  for (let index = 0; index < packId.length; index += 1) {
    hash = (hash + packId.charCodeAt(index)) % CATALOG_COVER_IMAGES.length;
  }
  return CATALOG_COVER_IMAGES[hash] ?? cover1;
}

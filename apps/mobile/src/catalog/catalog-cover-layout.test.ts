import { describe, expect, it } from 'vitest';
import {
  CATALOG_COVER_ASPECT_HEIGHT,
  CATALOG_COVER_ASPECT_WIDTH,
  CATALOG_COVER_UPLOAD_PX,
  CATALOG_PACK_ROW_HEIGHT,
  catalogCoverHeight,
  catalogCoverWidth,
  CATALOG_COVER_WIDTH_DETAIL,
  CATALOG_COVER_WIDTH_HOME,
  CATALOG_COVER_GRID_GAP,
  catalogCoverGridTileWidth,
  catalogCoverHeroWidth,
  catalogCoverShelfWidth,
  catalogPackRowCoverWidth,
} from './catalog-cover-layout';

describe('catalogCoverHeight', () => {
  it('uses 3:4 aspect ratio for all cover widths', () => {
    expect(CATALOG_COVER_ASPECT_WIDTH / CATALOG_COVER_ASPECT_HEIGHT).toBe(0.75);
    expect(catalogCoverHeight(CATALOG_COVER_WIDTH_DETAIL)).toBe(128);
    expect(catalogCoverHeight(CATALOG_COVER_WIDTH_HOME)).toBe(96);
    expect(catalogCoverHeight(catalogPackRowCoverWidth())).toBe(CATALOG_PACK_ROW_HEIGHT);
  });

  it('derives width from height for fill-height covers', () => {
    expect(catalogCoverWidth(100)).toBe(75);
    expect(catalogCoverWidth(CATALOG_PACK_ROW_HEIGHT)).toBe(CATALOG_COVER_WIDTH_HOME);
    expect(CATALOG_PACK_ROW_HEIGHT).toBe(96);
  });

  it('documents recommended upload pixels', () => {
    expect(CATALOG_COVER_UPLOAD_PX.width / CATALOG_COVER_UPLOAD_PX.height).toBe(0.75);
  });

  it('computes two-column grid tile width from container', () => {
    expect(
      catalogCoverGridTileWidth(360, {
        columns: 2,
        gap: CATALOG_COVER_GRID_GAP,
        horizontalPadding: 16,
      }),
    ).toBe(158);
  });

  it('computes hero cover width with upper bound', () => {
    expect(catalogCoverHeroWidth(360, 16)).toBe(125);
    expect(catalogCoverHeroWidth(280, 16)).toBe(94);
  });

  it('computes shelf cover width from screen width', () => {
    expect(catalogCoverShelfWidth(360)).toBe(259);
  });
});

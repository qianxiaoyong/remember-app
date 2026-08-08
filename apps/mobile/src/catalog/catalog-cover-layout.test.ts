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
  CATALOG_COVER_WIDTH_MARKET,
} from './catalog-cover-layout';

describe('catalogCoverHeight', () => {
  it('uses 3:4 aspect ratio for all cover widths', () => {
    expect(CATALOG_COVER_ASPECT_WIDTH / CATALOG_COVER_ASPECT_HEIGHT).toBe(0.75);
    expect(catalogCoverHeight(CATALOG_COVER_WIDTH_DETAIL)).toBe(128);
    expect(catalogCoverHeight(CATALOG_COVER_WIDTH_HOME)).toBe(96);
    expect(catalogCoverHeight(CATALOG_COVER_WIDTH_MARKET)).toBe(85);
  });

  it('derives width from height for fill-height covers', () => {
    expect(catalogCoverWidth(100)).toBe(75);
    expect(catalogCoverWidth(CATALOG_PACK_ROW_HEIGHT)).toBe(CATALOG_COVER_WIDTH_HOME);
    expect(CATALOG_PACK_ROW_HEIGHT).toBe(96);
  });

  it('documents recommended upload pixels', () => {
    expect(CATALOG_COVER_UPLOAD_PX.width / CATALOG_COVER_UPLOAD_PX.height).toBe(0.75);
  });
});

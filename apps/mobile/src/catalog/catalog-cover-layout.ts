/** 封面统一宽高比：3:4（与详情页 96×128 一致）。 */
export const CATALOG_COVER_ASPECT_WIDTH = 3;
export const CATALOG_COVER_ASPECT_HEIGHT = 4;

export function catalogCoverHeight(width: number): number {
  return Math.round((width * CATALOG_COVER_ASPECT_HEIGHT) / CATALOG_COVER_ASPECT_WIDTH);
}

export function catalogCoverWidth(height: number): number {
  return Math.round((height * CATALOG_COVER_ASPECT_WIDTH) / CATALOG_COVER_ASPECT_HEIGHT);
}

/** 各场景封面逻辑宽度（高度由 {@link catalogCoverHeight} 推导）。 */
export const CATALOG_COVER_WIDTH_HOME = 72;
/** @deprecated 资料列表封面宽见 {@link catalogPackRowCoverWidth} */
export const CATALOG_COVER_WIDTH_MARKET = 64;
export const CATALOG_COVER_WIDTH_DETAIL = 96;

/** 首页已安装行 / 资料列表卡片统一固定高度（= 首页封面高 96）。 */
export const CATALOG_PACK_ROW_HEIGHT = catalogCoverHeight(CATALOG_COVER_WIDTH_HOME);

export function catalogPackRowCoverWidth(): number {
  return catalogCoverWidth(CATALOG_PACK_ROW_HEIGHT);
}

/** 运营上传 coverUrl 建议像素（3:4 竖图）。 */
export const CATALOG_COVER_UPLOAD_PX = {
  width: 900,
  height: 1200,
} as const;

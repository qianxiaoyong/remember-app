/** 封面统一宽高比：3:4（与详情页 96×128 一致）。 */
export const CATALOG_COVER_ASPECT_WIDTH = 3;
export const CATALOG_COVER_ASPECT_HEIGHT = 4;

/** 网格/海报封面外圆角（小弧度）。 */
export const CATALOG_COVER_BORDER_RADIUS = 6;

/** 封面右上角「详」按钮尺寸（与旧行卡片一致）。 */
export const CATALOG_COVER_DETAIL_ICON_SIZE = 22;

/** 两列封面网格默认列数。 */
export const CATALOG_COVER_GRID_COLUMNS = 2;

/** 两列封面网格默认间距（dp）。 */
export const CATALOG_COVER_GRID_GAP = 12;

export function catalogCoverHeight(width: number): number {
  return Math.round((width * CATALOG_COVER_ASPECT_HEIGHT) / CATALOG_COVER_ASPECT_WIDTH);
}

export function catalogCoverWidth(height: number): number {
  return Math.round((height * CATALOG_COVER_ASPECT_WIDTH) / CATALOG_COVER_ASPECT_HEIGHT);
}

/** 在给定容器宽度内计算单列封面逻辑宽度（默认 2 列网格）。 */
export function catalogCoverGridTileWidth(
  containerWidth: number,
  options?: {
    columns?: number;
    gap?: number;
    horizontalPadding?: number;
  },
): number {
  const columns = options?.columns ?? CATALOG_COVER_GRID_COLUMNS;
  const gap = options?.gap ?? CATALOG_COVER_GRID_GAP;
  const horizontalPadding = options?.horizontalPadding ?? 0;
  const available = containerWidth - horizontalPadding * 2 - gap * (columns - 1);
  return Math.max(0, Math.floor(available / columns));
}

/** 首页继续学 Hero 左侧封面宽度（约 38% 内容区，上限 132）。 */
export function catalogCoverHeroWidth(containerWidth: number, horizontalPadding: number): number {
  const inner = containerWidth - horizontalPadding * 2;
  return Math.min(Math.round(inner * 0.38), 132);
}

/** 首页已安装大封面横滑宽度（72% 屏宽）。 */
export function catalogCoverShelfWidth(containerWidth: number): number {
  return Math.round(containerWidth * 0.72);
}

/** @deprecated 3D 舞台已移除，见 {@link catalogCoverShelfWidth} */
export function catalogCoverStageWidth(containerWidth: number): number {
  return catalogCoverShelfWidth(containerWidth);
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

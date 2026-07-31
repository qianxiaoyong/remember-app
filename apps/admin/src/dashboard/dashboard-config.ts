import { adminColors } from '../theme/admin-colors.js';

/** 与 apps/mobile/src/theme/colors.ts packCoverPalette 首色一致 */
export const dashboardChartColors = {
  line: adminColors.accent,
  bar: '#8E91C7',
  grid: adminColors.border,
  axis: adminColors.textMuted,
} as const;

export const dashboardKpiAccents = {
  revenue: adminColors.accent,
  orders: adminColors.accent,
  refund: adminColors.error,
  redemption: adminColors.price,
  users: '#7A9EC9',
  active: adminColors.success,
} as const;

export const dashboardRangeLabels: Record<'1d' | '7d' | '30d', string> = {
  '1d': '今日',
  '7d': '近 7 天',
  '30d': '近 30 天',
};

export type DashboardAlertKind = 'paid_without_access' | 'pending_refund' | 'redemption_code_low';

export function alertTargetResource(kind: DashboardAlertKind): string {
  switch (kind) {
    case 'paid_without_access':
      return 'pack-access';
    case 'pending_refund':
      return 'orders';
    case 'redemption_code_low':
      return 'redemption-codes';
  }
}

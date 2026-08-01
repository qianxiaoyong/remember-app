import { Box, Typography } from '@mui/material';
import type { AdminDashboardRange } from '@remember/contracts';
import type { TooltipProps } from 'recharts';
import { formatMoney } from '../components/format-money.js';
import { adminColors } from '../theme/admin-colors.js';

export function formatChartDate(date: string): string {
  const parts = date.split('-');
  const month = parts[1];
  const day = parts[2];
  if (!month || !day) {
    return date;
  }
  return `${month}-${day}`;
}

export function RevenueTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as
    { date?: string; paidAmountCents?: number; paidOrderCount?: number } | undefined;

  if (!point) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: adminColors.surface,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1.5,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {point.date}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        GMV {formatMoney(point.paidAmountCents ?? 0)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        订单 {String(point.paidOrderCount ?? 0)} 笔
      </Typography>
    </Box>
  );
}

export function TopPackTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload as
    { title?: string; paidOrderCount?: number; paidAmountCents?: number } | undefined;

  if (!item) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: adminColors.surface,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1.5,
        maxWidth: 240,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        销量 {String(item.paidOrderCount ?? 0)} · {formatMoney(item.paidAmountCents ?? 0)}
      </Typography>
    </Box>
  );
}

export function PackStatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 120,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: adminColors.statTileBackground,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

export function resolveRegisteredSince(range: AdminDashboardRange): string {
  const start = new Date();
  if (range === '1d') {
    start.setDate(start.getDate() - 1);
  } else if (range === '7d') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return start.toISOString();
}

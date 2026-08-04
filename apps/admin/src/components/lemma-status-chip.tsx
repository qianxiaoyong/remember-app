import type { LemmaStatus } from '@remember/contracts';
import { Chip } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

const lemmaStatusConfig: Record<LemmaStatus, { label: string; color: string; background: string }> =
  {
    published: {
      label: '已发布',
      color: adminColors.success,
      background: 'rgba(92, 184, 138, 0.14)',
    },
    draft: {
      label: '草稿',
      color: adminColors.warning,
      background: 'rgba(240, 160, 75, 0.14)',
    },
    archived: {
      label: '已归档',
      color: adminColors.textMuted,
      background: adminColors.statTileBackground,
    },
  };

export function LemmaStatusChip({ status }: { status: LemmaStatus }) {
  const config = lemmaStatusConfig[status];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        height: 24,
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.background,
      }}
    />
  );
}

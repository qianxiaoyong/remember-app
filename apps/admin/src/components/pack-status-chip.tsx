import { Chip } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

type PackStatus = 'draft' | 'published';

const packStatusConfig: Record<PackStatus, { label: string; color: string; background: string }> = {
  draft: {
    label: '草稿',
    color: adminColors.warning,
    background: 'rgba(240, 160, 75, 0.14)',
  },
  published: {
    label: '已上架',
    color: adminColors.success,
    background: 'rgba(92, 184, 138, 0.14)',
  },
};

export function PackStatusChip({ status }: { status: string }) {
  const config =
    status in packStatusConfig
      ? packStatusConfig[status as PackStatus]
      : {
          label: status,
          color: adminColors.textSecondary,
          background: adminColors.statTileBackground,
        };

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

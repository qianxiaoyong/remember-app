import { Box, Chip, Stack, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { MonoText } from '../components/mono-text.js';
import { PackStatusChip } from '../components/pack-status-chip.js';
import { adminColors } from '../theme/admin-colors.js';

function formatUpdatedAt(value?: string): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PackEditSummary() {
  const record = useRecordContext<{
    packId?: string;
    title?: string;
    status?: string;
    currentPackVersion?: string;
    cardCount?: number;
    sizeLabel?: string;
    updatedAt?: string;
  }>();

  if (!record?.packId) {
    return null;
  }

  return (
    <Box
      sx={{
        mx: 2,
        mt: 0.5,
        mb: 0,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        border: `1px solid ${adminColors.border}`,
        bgcolor: adminColors.surface,
      }}
    >
      <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 0.5 }}>
          {record.title ?? record.packId}
        </Typography>
        <MonoText>{record.packId}</MonoText>
        {record.status ? <PackStatusChip status={record.status} /> : null}
        {record.currentPackVersion ? (
          <Chip label={`v${record.currentPackVersion}`} size="small" sx={{ height: 22 }} />
        ) : (
          <Chip label="未发布" size="small" variant="outlined" sx={{ height: 22 }} />
        )}
        <Typography variant="caption" color="text.secondary">
          {record.cardCount ?? '—'} 词 · {record.sizeLabel ?? '—'} · 更新 {formatUpdatedAt(record.updatedAt)}
        </Typography>
      </Stack>
    </Box>
  );
}

import { Box, Chip, Stack, Typography } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { MonoText } from '../components/mono-text.js';
import { PackStatusChip } from '../components/pack-status-chip.js';
import { adminColors } from '../theme/admin-colors.js';

export function PackEditSummary() {
  const record = useRecordContext<{
    packId?: string;
    title?: string;
    status?: string;
    currentPackVersion?: string;
  }>();

  if (!record?.packId) {
    return null;
  }

  return (
    <Box
      sx={{
        mx: 2,
        mt: 1,
        mb: 0,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        border: `1px solid ${adminColors.border}`,
        bgcolor: adminColors.surface,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {record.title ?? record.packId}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <MonoText>{record.packId}</MonoText>
        {record.status ? <PackStatusChip status={record.status} /> : null}
        {record.currentPackVersion ? (
          <Chip
            label={`当前版本 ${record.currentPackVersion}`}
            size="small"
            sx={{
              height: 24,
              bgcolor: adminColors.accentSoft,
              color: adminColors.accent,
              fontWeight: 600,
            }}
          />
        ) : (
          <Chip
            label="尚未发布内容版本"
            size="small"
            variant="outlined"
            sx={{ height: 24, borderColor: adminColors.border }}
          />
        )}
      </Stack>
    </Box>
  );
}

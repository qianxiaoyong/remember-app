import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface AdminPageHeaderProps {
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  tabs?: ReactNode;
}

/** L1 页头：标题 + 元信息 + 操作；Tab 贴在 header 下沿。 */
export function AdminPageHeader(props: AdminPageHeaderProps) {
  return (
    <Box
      sx={{
        bgcolor: adminColors.surface,
        borderBottom: `1px solid ${adminColors.border}`,
        mb: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: props.tabs ? 0 : 1.5 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.4,
              color: adminColors.textPrimary,
            }}
          >
            {props.title}
          </Typography>
          {props.meta ? (
            <Box sx={{ mt: 0.5, color: adminColors.textSecondary, fontSize: 13 }}>{props.meta}</Box>
          ) : null}
        </Box>
        {props.actions ? <Box sx={{ flexShrink: 0 }}>{props.actions}</Box> : null}
      </Stack>
      {props.tabs ? (
        <Box sx={{ px: { xs: 1, sm: 2 }, borderTop: props.meta || props.actions ? `1px solid ${adminColors.border}` : undefined }}>
          {props.tabs}
        </Box>
      ) : null}
    </Box>
  );
}

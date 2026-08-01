import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { adminColors } from '../theme/admin-colors.js';

interface AdminPanelProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** 表格式内容区可设为 false 以去掉内边距 */
  padded?: boolean;
  sx?: SxProps<Theme>;
}

/** L2 区块：sunken 头 + 白底 body；禁止 Panel 套 Panel。 */
export function AdminPanel(props: AdminPanelProps) {
  const padded = props.padded ?? true;

  return (
    <Box
      sx={
        [
          {
            border: `1px solid ${adminColors.border}`,
            borderRadius: 1.5,
            bgcolor: adminColors.surface,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          },
          props.sx,
        ] as SxProps<Theme>
      }
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: adminColors.surfaceSunken,
          borderBottom: `1px solid ${adminColors.border}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: adminColors.textPrimary }}>
            {props.title}
          </Typography>
          {props.subtitle ? (
            <Typography sx={{ fontSize: 12, color: adminColors.textTertiary, mt: 0.25 }}>
              {props.subtitle}
            </Typography>
          ) : null}
        </Box>
        {props.actions ? <Box sx={{ flexShrink: 0, ml: 1 }}>{props.actions}</Box> : null}
      </Stack>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: padded ? 1.5 : 0,
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
}

/** 表格类 Panel 表头 sunken 样式 */
export const adminPanelTableSx = {
  '& .MuiTableCell-root': { py: 0.35, px: 1, fontSize: '0.8125rem', whiteSpace: 'nowrap' },
  '& .MuiTableCell-head': {
    py: 0.5,
    fontWeight: 600,
    bgcolor: adminColors.surfaceSunken,
    color: adminColors.textSecondary,
  },
} as const;

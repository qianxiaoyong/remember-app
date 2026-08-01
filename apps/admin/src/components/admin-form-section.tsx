import type { ReactNode } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface AdminFormSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  /** 默认 true；设为 false 用于连续区块内的子段 */
  divider?: boolean;
}

export function AdminFormSection(props: AdminFormSectionProps) {
  const showDivider = props.divider ?? true;

  return (
    <Box sx={{ mb: showDivider ? 0 : 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            color: adminColors.textPrimary,
            pl: 1,
            borderLeft: `3px solid ${adminColors.accent}`,
          }}
        >
          {props.title}
        </Typography>
        {props.action ? <Box>{props.action}</Box> : null}
      </Stack>
      {props.children}
      {showDivider ? <Divider sx={{ mt: 1.5, mb: 0 }} /> : null}
    </Box>
  );
}

interface AdminLabeledFieldProps {
  label: string;
  requiredMark?: boolean;
  children: ReactNode;
}

/** 顶置标签，避免 outlined 浮动标签占高。 */
export function AdminLabeledField(props: AdminLabeledFieldProps) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography
        component="label"
        sx={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: adminColors.textSecondary,
          mb: 0.25,
        }}
      >
        {props.label}
        {props.requiredMark ? (
          <Typography component="span" color="error" sx={{ ml: 0.25 }}>
            *
          </Typography>
        ) : null}
      </Typography>
      {props.children}
    </Box>
  );
}

/** 知识库编辑单页白底表单容器。 */
export const packCatalogFormSurfaceSx = {
  bgcolor: adminColors.surface,
  border: `1px solid ${adminColors.border}`,
  borderRadius: 1.5,
  overflow: 'hidden',
} as const;

export const packCatalogMainColumnSx = {
  p: { xs: 1.5, sm: 2 },
} as const;

export const packCatalogSidebarSx = {
  p: { xs: 1.5, sm: 2 },
  bgcolor: adminColors.surfaceSunken,
  borderLeft: { lg: `1px solid ${adminColors.border}` },
  position: { lg: 'sticky' },
  top: { lg: 56 },
  alignSelf: 'flex-start',
} as const;

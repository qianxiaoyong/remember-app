import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface PackFormSectionProps {
  title: string;
  children: ReactNode;
}

/** 紧凑分区：仅小标题 + 内容，无 Card 嵌套。 */
export function PackFormSection(props: PackFormSectionProps) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: adminColors.textPrimary, mb: 0.5 }}>
        {props.title}
      </Typography>
      {props.children}
    </Box>
  );
}

/** 全局压紧 react-admin 表单项行距（包编辑页根容器 sx 引用）。 */
export const packFormDensitySx = {
  '& .MuiFormControl-root': { my: 0.5 },
  '& .MuiInputBase-root': { fontSize: '0.875rem' },
  '& .RaSimpleFormIterator-line': {
    border: 'none',
    mb: 0.5,
    mt: 0,
    p: 0,
  },
  '& .RaSimpleFormIterator-add': { my: 0.5 },
  '& .RaSimpleFormIterator-form': { minWidth: 0 },
} as const;

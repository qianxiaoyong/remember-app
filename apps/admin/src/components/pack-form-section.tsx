import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface PackFormSectionProps {
  title: string;
  children: ReactNode;
}

/** 表单区块：仅小标题 + 内容，无 Card 嵌套。 */
export function PackFormSection(props: PackFormSectionProps) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: adminColors.textPrimary, mb: 0.5 }}>
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

/** Array 行紧凑：inline 表格风格。 */
export const compactIteratorSx = {
  '& .RaSimpleFormIterator-line': {
    border: 'none',
    mb: 0.25,
    mt: 0,
    p: 0,
    alignItems: 'center',
  },
  '& .RaSimpleFormIterator-form': {
    display: 'flex',
    flex: 1,
    gap: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  '& .RaSimpleFormIterator-action': {
    mt: 0,
    alignSelf: 'center',
    flexShrink: 0,
  },
  '& .RaSimpleFormIterator-add': { my: 0.5 },
  '& .RaSimpleFormIterator-index': { display: 'none' },
} as const;

/** SimpleForm 去 Card 内边距。 */
export const packEditFormSx = {
  padding: 0,
  '& .MuiCardContent-root': { p: 0, '&:last-child': { pb: 0 } },
} as const;

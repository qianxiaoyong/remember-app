import type { ReactNode } from 'react';
import { ArrayInput, Button } from 'react-admin';
import { Box, Stack, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { adminColors } from '../theme/admin-colors.js';

interface CompactArrayBlockProps {
  source: string;
  title: string;
  defaultItem: Record<string, unknown> | ((count: number) => Record<string, unknown>);
  headerAction?: ReactNode;
  children: ReactNode;
}

/** 空态一行提示；有数据时表格式 ArrayInput。 */
export function CompactArrayBlock(props: CompactArrayBlockProps) {
  const items = useWatch({ name: props.source }) as unknown[] | undefined;
  const { setValue } = useFormContext();
  const count = Array.isArray(items) ? items.length : 0;

  const addItem = () => {
    const current = Array.isArray(items) ? items : [];
    const nextItem =
      typeof props.defaultItem === 'function'
        ? props.defaultItem(current.length)
        : props.defaultItem;
    setValue(props.source, [...current, nextItem], { shouldDirty: true });
  };

  return (
    <Box sx={{ mb: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: adminColors.textPrimary }}>
          {props.title}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {props.headerAction}
          {count > 0 ? <Button label="+ 添加" size="small" onClick={addItem} /> : null}
        </Stack>
      </Stack>

      {count === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 0.25, fontSize: 13 }}>
          暂无条目 ·{' '}
          <Button
            label="+ 添加"
            size="small"
            variant="text"
            sx={{ minWidth: 0, p: 0, verticalAlign: 'baseline', fontSize: 13 }}
            onClick={addItem}
          />
        </Typography>
      ) : (
        <ArrayInput source={props.source} label="">
          {props.children}
        </ArrayInput>
      )}
    </Box>
  );
}

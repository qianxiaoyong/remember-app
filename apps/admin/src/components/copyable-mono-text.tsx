import type { ReactNode } from 'react';
import { IconButton, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MonoText } from './mono-text.js';

interface CopyableMonoTextProps {
  value: string;
  children?: ReactNode;
  variant?: 'body2' | 'caption';
}

export function CopyableMonoText({ value, children, variant = 'body2' }: CopyableMonoTextProps) {
  const label = children ?? value;

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
      <MonoText variant={variant}>{label}</MonoText>
      <Tooltip title="复制">
        <IconButton
          size="small"
          aria-label="复制"
          onClick={(event) => {
            event.stopPropagation();
            void navigator.clipboard.writeText(value);
          }}
          sx={{ p: 0.25 }}
        >
          <ContentCopyIcon sx={{ fontSize: variant === 'caption' ? 14 : 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

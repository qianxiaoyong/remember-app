import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface MonoTextProps {
  children: ReactNode;
  variant?: 'body2' | 'caption';
}

export function MonoText({ children, variant = 'body2' }: MonoTextProps) {
  return (
    <Typography
      variant={variant}
      component="span"
      sx={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: variant === 'caption' ? '0.75rem' : '0.875rem',
      }}
    >
      {children}
    </Typography>
  );
}

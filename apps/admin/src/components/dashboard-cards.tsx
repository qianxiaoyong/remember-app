import type { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { AdminPanel } from './admin-panel.js';
import { adminColors } from '../theme/admin-colors.js';

interface KpiStatCardProps {
  label: string;
  value: string;
  accent: string;
  hint?: string;
  onClick?: () => void;
}

export function KpiStatCard({ label, value, accent, hint, onClick }: KpiStatCardProps) {
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        height: '100%',
        bgcolor: adminColors.surfaceSunken,
        borderColor: adminColors.border,
        ...(onClick
          ? {
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                borderColor: accent,
                boxShadow: `0 0 0 1px ${accent}`,
              },
            }
          : {}),
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Box
            sx={{
              width: 4,
              borderRadius: 999,
              bgcolor: accent,
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {value}
            </Typography>
            {hint ? (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {hint}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface DashboardSectionCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardSectionCard({
  title,
  subtitle,
  action,
  children,
}: DashboardSectionCardProps) {
  return (
    <AdminPanel
      title={title}
      {...(subtitle ? { subtitle } : {})}
      {...(action ? { actions: action } : {})}
      sx={{ height: '100%' }}
    >
      {children}
    </AdminPanel>
  );
}

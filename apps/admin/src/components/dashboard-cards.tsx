import type { ReactNode } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface KpiStatCardProps {
  label: string;
  value: string;
  accent: string;
  hint?: string;
}

export function KpiStatCard({ label, value, accent, hint }: KpiStatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        bgcolor: adminColors.statTileBackground,
        borderColor: adminColors.border,
      }}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
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
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}

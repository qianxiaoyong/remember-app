import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useResourceDefinitions } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { parseAdminRoute } from '../layout/admin-route-meta.js';
import { adminColors } from '../theme/admin-colors.js';

interface AdminBreadcrumbProps {
  sx?: SxProps<Theme>;
}

export function AdminBreadcrumb(props: AdminBreadcrumbProps) {
  const location = useLocation();
  const definitions = useResourceDefinitions();
  const route = parseAdminRoute(location.pathname, definitions);

  if (route.breadcrumbSegments.length === 0) {
    return null;
  }

  return (
    <Box
      sx={
        [
          {
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'nowrap',
            gap: 0.75,
            minWidth: 0,
            overflow: 'hidden',
          },
          props.sx,
        ] as SxProps<Theme>
      }
    >
      {route.breadcrumbSegments.map((segment, index) => {
        const isLast = index === route.breadcrumbSegments.length - 1;
        return (
          <Box
            key={`${segment}-${String(index)}`}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
          >
            {index > 0 ? (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: adminColors.textTertiary, flexShrink: 0 }}
              >
                /
              </Typography>
            ) : null}
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: isLast ? adminColors.textPrimary : adminColors.textSecondary,
                fontWeight: isLast ? 600 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {segment}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

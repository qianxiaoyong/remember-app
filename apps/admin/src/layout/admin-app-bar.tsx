import { AppBar, LoadingIndicator, TitlePortal, UserMenu } from 'react-admin';
import { Box, Chip, Typography } from '@mui/material';
import { AdminBreadcrumb } from '../components/admin-breadcrumb.js';
import { adminColors } from '../theme/admin-colors.js';

const hiddenTitlePortalSx = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

export function AdminAppBar() {
  return (
    <AppBar
      userMenu={<UserMenu />}
      toolbar={
        <>
          <TitlePortal sx={hiddenTitlePortalSx} />
          <LoadingIndicator />
        </>
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flexShrink: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: adminColors.textPrimary,
            whiteSpace: 'nowrap',
            fontSize: '1rem',
          }}
        >
          记得
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: adminColors.textSecondary,
            whiteSpace: 'nowrap',
            display: { xs: 'none', md: 'block' },
          }}
        >
          · 运营后台
        </Typography>
        {import.meta.env.DEV ? (
          <Chip
            label="DEV"
            size="small"
            sx={{
              height: 22,
              bgcolor: adminColors.surfaceSunken,
              color: adminColors.textSecondary,
              fontWeight: 600,
            }}
          />
        ) : null}
      </Box>
      <AdminBreadcrumb
        sx={{ flex: 1, ml: { xs: 1, md: 2 }, display: { xs: 'none', sm: 'flex' } }}
      />
    </AppBar>
  );
}

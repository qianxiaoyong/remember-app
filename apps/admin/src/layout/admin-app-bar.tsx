import { AppBar, TitlePortal, UserMenu } from 'react-admin';
import { Box, Chip, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

export function AdminAppBar() {
  return (
    <AppBar userMenu={<UserMenu />} toolbar={<TitlePortal />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: adminColors.textPrimary, whiteSpace: 'nowrap' }}
        >
          记得
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: adminColors.textSecondary,
            whiteSpace: 'nowrap',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          运营后台
        </Typography>
        {import.meta.env.DEV ? (
          <Chip
            label="DEV"
            size="small"
            sx={{
              height: 22,
              bgcolor: adminColors.statTileBackground,
              color: adminColors.textSecondary,
              fontWeight: 600,
            }}
          />
        ) : null}
      </Box>
    </AppBar>
  );
}

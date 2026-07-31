import { Login, LoginForm } from 'react-admin';
import { Box, Typography } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

export function AdminLoginPage() {
  return (
    <Login
      sx={{
        backgroundColor: adminColors.background,
        '& .RaLogin-card': {
          borderRadius: 3,
          border: `1px solid ${adminColors.border}`,
          boxShadow: 'none',
          maxWidth: 420,
        },
        '& .RaLogin-avatar': {
          display: 'none',
        },
        '& .RaLogin-button': {
          borderRadius: 2,
        },
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3, px: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          记得 · 运营后台
        </Typography>
        <Typography variant="body2" color="text.secondary">
          内部管理系统
        </Typography>
      </Box>
      <LoginForm />
    </Login>
  );
}

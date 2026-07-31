import { createTheme } from '@mui/material/styles';
import { adminColors } from './admin-colors.js';

export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: adminColors.accent,
      contrastText: adminColors.surface,
    },
    secondary: {
      main: adminColors.price,
    },
    background: {
      default: adminColors.background,
      paper: adminColors.surface,
    },
    text: {
      primary: adminColors.textPrimary,
      secondary: adminColors.textSecondary,
    },
    divider: adminColors.border,
    error: { main: adminColors.error },
    warning: { main: adminColors.warning },
    success: { main: adminColors.success },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"PingFang SC"',
      '"Microsoft YaHei"',
      '"Noto Sans SC"',
      'sans-serif',
    ].join(','),
    h5: { fontWeight: 600, color: adminColors.textPrimary },
    h6: { fontWeight: 600, color: adminColors.textPrimary },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: adminColors.background,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: adminColors.surface,
          color: adminColors.textPrimary,
          boxShadow: 'none',
          borderBottom: `1px solid ${adminColors.border}`,
        },
      },
      defaultProps: {
        color: 'default',
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: adminColors.surface,
          borderRight: `1px solid ${adminColors.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          borderColor: adminColors.border,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: adminColors.border,
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: adminColors.surface,
          color: adminColors.textMuted,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '32px',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: adminColors.textSecondary,
          fontWeight: 600,
        },
      },
    },
    RaLayout: {
      styleOverrides: {
        root: {
          '& .RaLayout-content': {
            backgroundColor: adminColors.background,
          },
        },
      },
    },
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 8,
          marginBlock: 2,
          '&.RaMenuItemLink-active': {
            backgroundColor: adminColors.accentSoft,
            borderLeft: `3px solid ${adminColors.accent}`,
            paddingLeft: 13,
          },
        },
      },
    },
  },
});

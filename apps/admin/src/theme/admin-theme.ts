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
      default: adminColors.shellCanvas,
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
    h5: { fontSize: 18, fontWeight: 700, color: adminColors.textPrimary },
    h6: { fontSize: 16, fontWeight: 600, color: adminColors.textPrimary },
    subtitle1: { fontSize: 14, fontWeight: 600, color: adminColors.textPrimary },
    subtitle2: { fontSize: 14, fontWeight: 600, color: adminColors.textPrimary },
    body2: { fontSize: 13 },
    caption: { fontSize: 12, color: adminColors.textTertiary },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          height: '100%',
          overflow: 'hidden',
        },
        body: {
          height: '100%',
          overflow: 'hidden',
          backgroundColor: adminColors.shellCanvas,
        },
        '#root': {
          height: '100%',
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          position: 'fixed',
          backgroundColor: adminColors.surface,
          color: adminColors.textPrimary,
          boxShadow: 'none',
          borderBottom: `1px solid ${adminColors.borderStrong}`,
        },
      },
      defaultProps: {
        color: 'default',
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: adminColors.shellSidebar,
          borderRight: `1px solid ${adminColors.borderStrong}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
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
          backgroundColor: adminColors.surface,
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
          backgroundColor: adminColors.menuGroupTint,
          color: adminColors.textSecondary,
          fontSize: 11,
          fontWeight: 700,
          lineHeight: '28px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          paddingLeft: 16,
          paddingRight: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          color: adminColors.textSecondary,
          fontWeight: 600,
          backgroundColor: adminColors.surfaceSunken,
          fontSize: '0.8125rem',
        },
        root: {
          borderColor: adminColors.border,
        },
      },
    },
    RaLayout: {
      styleOverrides: {
        root: {
          height: '100vh',
          overflow: 'hidden',
          '& .RaLayout-appFrame': {
            backgroundColor: adminColors.shellCanvas,
          },
          '& .RaLayout-content': {
            backgroundColor: adminColors.shellCanvas,
          },
        },
      },
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          '& .RaSidebar-fixed': {
            backgroundColor: adminColors.shellSidebar,
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
          fontSize: '0.875rem',
          color: adminColors.textPrimary,
          '& .MuiListItemIcon-root': {
            minWidth: 36,
            color: adminColors.textSecondary,
          },
          '&.RaMenuItemLink-active': {
            backgroundColor: adminColors.menuActiveBackground,
            borderLeft: `3px solid ${adminColors.accent}`,
            paddingLeft: 13,
            fontWeight: 600,
            '& .MuiListItemIcon-root': {
              color: adminColors.accent,
            },
          },
        },
      },
    },
  },
});

import type { LayoutProps } from 'react-admin';
import { Layout } from 'react-admin';
import { AdminAppBar } from './admin-app-bar.js';
import { AdminMenu } from './admin-menu.js';
import { adminColors } from '../theme/admin-colors.js';

export function AdminLayout(props: LayoutProps) {
  return (
    <Layout
      {...props}
      appBar={AdminAppBar}
      menu={AdminMenu}
      sx={{
        height: '100vh',
        overflow: 'hidden',
        '& .RaLayout-appFrame': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          marginTop: 6,
        },
        '& .RaLayout-contentWithSidebar': {
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: adminColors.shellCanvas,
        },
        '& .RaLayout-content': {
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: { xs: 1.5, sm: 2 },
          backgroundColor: adminColors.shellCanvas,
        },
        '& .RaSidebar-fixed': {
          overflowY: 'auto',
        },
      }}
    />
  );
}

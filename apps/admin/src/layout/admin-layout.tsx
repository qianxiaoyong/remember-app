import type { LayoutProps } from 'react-admin';
import { Layout } from 'react-admin';
import { AdminAppBar } from './admin-app-bar.js';
import { AdminMenu } from './admin-menu.js';

export function AdminLayout(props: LayoutProps) {
  return (
    <Layout
      {...props}
      appBar={AdminAppBar}
      menu={AdminMenu}
      sx={{
        '& .RaLayout-appFrame': {
          marginTop: 6,
        },
        '& .RaLayout-content': {
          padding: { xs: 1.5, sm: 2, md: 3 },
        },
      }}
    />
  );
}

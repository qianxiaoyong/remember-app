import { SaveButton, Toolbar } from 'react-admin';
import { adminColors } from '../theme/admin-colors.js';

export function PackFormToolbar() {
  return (
    <Toolbar
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        minHeight: 48,
        bgcolor: adminColors.surface,
        borderTop: `1px solid ${adminColors.border}`,
        py: 0.5,
      }}
    >
      <SaveButton />
    </Toolbar>
  );
}

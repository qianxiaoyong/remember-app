import type { MenuProps } from 'react-admin';
import { Menu, MenuItemLink } from 'react-admin';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import { ListSubheader } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

function MenuGroupTitle({ children }: { children: string }) {
  return (
    <ListSubheader
      disableSticky
      sx={{
        bgcolor: adminColors.menuGroupTint,
        lineHeight: '28px',
        mt: 0.5,
      }}
    >
      {children}
    </ListSubheader>
  );
}

export function AdminMenu(props: MenuProps) {
  return (
    <Menu {...props} sx={{ pt: 0.5, ...props.sx }}>
      <Menu.DashboardItem primaryText="驾驶舱" leftIcon={<DashboardIcon />} />
      <MenuGroupTitle>内容</MenuGroupTitle>
      <Menu.ResourceItem name="packs" />
      <MenuItemLink
        to="/catalog-taxonomy"
        primaryText="分类管理"
        leftIcon={<CategoryIcon />}
        sx={{
          pl: 3.5,
          '& .MuiListItemText-primary': { fontSize: '0.8125rem' },
        }}
      />
      <Menu.ResourceItem name="redemption-codes" />
      <MenuGroupTitle>交易</MenuGroupTitle>
      <Menu.ResourceItem name="orders" />
      <Menu.ResourceItem name="pack-access" />
      <Menu.ResourceItem name="refunds" />
      <MenuGroupTitle>系统</MenuGroupTitle>
      <Menu.ResourceItem name="audit-logs" />
    </Menu>
  );
}

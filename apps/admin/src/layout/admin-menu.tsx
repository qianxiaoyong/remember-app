import type { MenuProps } from 'react-admin';
import { Menu } from 'react-admin';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CategoryIcon from '@mui/icons-material/Category';
import { MenuItemLink } from 'react-admin';
import { ListSubheader } from '@mui/material';

function MenuGroupTitle({ children }: { children: string }) {
  return <ListSubheader disableSticky>{children}</ListSubheader>;
}

export function AdminMenu(props: MenuProps) {
  return (
    <Menu {...props}>
      <Menu.DashboardItem primaryText="驾驶舱" leftIcon={<DashboardIcon />} />
      <MenuGroupTitle>内容</MenuGroupTitle>
      <Menu.ResourceItem name="packs" />
      <MenuItemLink to="/catalog-taxonomy" primaryText="分类管理" leftIcon={<CategoryIcon />} />
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

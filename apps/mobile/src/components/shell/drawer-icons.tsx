import type { ReactElement } from 'react';
import { View } from 'react-native';
import type { DrawerMenuItemId } from '../../shell/drawer-menu-config';
import { AppIcon, type AppIconName } from '../ui/app-icon';
import { colors } from '../../theme/colors';

interface DrawerMenuIconProps {
  itemId: DrawerMenuItemId;
}

const DRAWER_MENU_ICON: Partial<Record<DrawerMenuItemId, AppIconName>> = {
  downloads: 'download-outline',
  favorites: 'bookmark-outline',
  settings: 'settings-outline',
  about: 'information-circle-outline',
  contact: 'chatbubble-outline',
};

export function DrawerMenuIcon(props: DrawerMenuIconProps): ReactElement {
  const iconName = DRAWER_MENU_ICON[props.itemId];
  return (
    <View style={{ alignItems: 'center', height: 20, justifyContent: 'center', width: 20 }}>
      {iconName ? (
        <AppIcon color={colors.textSecondary} name={iconName} size="sm" />
      ) : null}
    </View>
  );
}

import type { ReactElement } from 'react';
import { View } from 'react-native';
import { AppIcon } from './app-icon';
import { colors } from '../../theme/colors';

interface HomeTabIconProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function HomeTabIcon(props: HomeTabIconProps): ReactElement {
  const color = props.color ?? (props.active ? colors.textPrimary : colors.tabInactive);
  return (
    <View style={{ alignItems: 'center', height: 28, justifyContent: 'center', width: 28 }}>
      <AppIcon color={color} name={props.active ? 'home' : 'home-outline'} size="lg" />
    </View>
  );
}

interface FolderTabIconProps {
  active: boolean;
}

export function FolderTabIcon(props: FolderTabIconProps): ReactElement {
  const color = props.active ? colors.textPrimary : colors.tabInactive;
  return (
    <View style={{ alignItems: 'center', height: 28, justifyContent: 'center', width: 28 }}>
      <AppIcon color={color} name={props.active ? 'folder' : 'folder-outline'} size="lg" />
    </View>
  );
}

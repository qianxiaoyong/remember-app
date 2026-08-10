import type { ComponentProps, ReactElement } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { type IconSize } from './shell-icon-scales';

export type AppIconName =
  | 'menu'
  | 'search'
  | 'chevron-back'
  | 'chevron-forward'
  | 'add'
  | 'home'
  | 'home-outline'
  | 'folder'
  | 'folder-outline'
  | 'download-outline'
  | 'bookmark-outline'
  | 'settings-outline'
  | 'information-circle-outline'
  | 'chatbubble-outline'
  | 'compass-outline'
  | 'library-outline'
  | 'ticket-outline'
  | 'eye-outline'
  | 'ellipsis-vertical'
  | 'star'
  | 'star-outline'
  | 'volume-low-outline'
  | 'volume-medium-outline'
  | 'volume-high-outline'
  | 'musical-notes-outline'
  | 'play'
  | 'pause'
  | 'play-skip-back'
  | 'play-skip-forward'
  | 'arrow-up'
  | 'arrow-down'
  | 'repeat'
  | 'repeat-outline'
  | 'play-circle-outline';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ICON_MAP: Record<AppIconName, IoniconName> = {
  menu: 'menu-outline',
  search: 'search-outline',
  'chevron-back': 'chevron-back',
  'chevron-forward': 'chevron-forward',
  add: 'add',
  home: 'home',
  'home-outline': 'home-outline',
  folder: 'folder',
  'folder-outline': 'folder-outline',
  'download-outline': 'download-outline',
  'bookmark-outline': 'bookmark-outline',
  'settings-outline': 'settings-outline',
  'information-circle-outline': 'information-circle-outline',
  'chatbubble-outline': 'chatbubble-outline',
  'compass-outline': 'compass-outline',
  'library-outline': 'library-outline',
  'ticket-outline': 'ticket-outline',
  'eye-outline': 'eye-outline',
  'ellipsis-vertical': 'ellipsis-vertical',
  star: 'star',
  'star-outline': 'star-outline',
  'volume-low-outline': 'volume-low-outline',
  'volume-medium-outline': 'volume-medium-outline',
  'volume-high-outline': 'volume-high-outline',
  'musical-notes-outline': 'musical-notes-outline',
  play: 'play',
  pause: 'pause',
  'play-skip-back': 'play-skip-back',
  'play-skip-forward': 'play-skip-forward',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  repeat: 'repeat',
  'repeat-outline': 'repeat-outline',
  'play-circle-outline': 'play-circle-outline',
};

interface AppIconProps {
  name: AppIconName;
  size?: IconSize;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function resolveIconPixelSize(size: IconSize = 'md'): number {
  if (size === 'sm') {
    return 18;
  }
  if (size === 'lg') {
    return 26;
  }
  return 22;
}

export function AppIcon(props: AppIconProps): ReactElement {
  return (
    <Ionicons
      color={props.color ?? colors.textPrimary}
      name={ICON_MAP[props.name]}
      size={resolveIconPixelSize(props.size)}
      {...(props.style ? { style: props.style } : {})}
    />
  );
}

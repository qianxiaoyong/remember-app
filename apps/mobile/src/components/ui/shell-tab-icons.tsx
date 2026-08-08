import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

/** 底部 Tab 复习钮：品牌字母 M。 */
export function ReviewTabMark(): ReactElement {
  return <Text style={reviewTabMarkStyles.glyph}>M</Text>;
}

const reviewTabMarkStyles = StyleSheet.create({
  glyph: {
    color: colors.surface,
    fontSize: 32,
    fontStyle: 'italic',
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: 36,
    textAlign: 'center',
  },
});

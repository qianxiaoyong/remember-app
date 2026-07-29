import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { sizeScale } from './shell-icon-scales';

interface HomeTabIconProps {
  active: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function HomeTabIcon(props: HomeTabIconProps): ReactElement {
  const scale = sizeScale(props.size ?? 'lg');
  const color = props.color ?? (props.active ? colors.textPrimary : colors.tabInactive);
  return (
    <View style={[styles.home, { height: scale.tabHeight, width: scale.tabWidth }]}>
      <View
        style={[
          styles.homeRoof,
          {
            borderBottomColor: color,
            borderLeftWidth: scale.homeRoof / 2,
            borderRightWidth: scale.homeRoof / 2,
            borderBottomWidth: scale.homeRoof * 0.45,
          },
        ]}
      />
      <View
        style={[
          styles.homeBody,
          {
            height: scale.homeBodyH,
            width: scale.homeBodyW,
            marginTop: 1,
          },
          props.active
            ? { backgroundColor: color }
            : { borderColor: color, borderWidth: scale.homeStroke, backgroundColor: 'transparent' },
        ]}
      />
    </View>
  );
}

interface FolderTabIconProps {
  active: boolean;
}

export function FolderTabIcon(props: FolderTabIconProps): ReactElement {
  const color = props.active ? colors.textPrimary : colors.tabInactive;
  const scale = sizeScale('lg');
  return (
    <View style={[styles.folder, { height: scale.tabHeight, width: scale.tabWidth }]}>
      <View
        style={[
          styles.folderTab,
          {
            backgroundColor: color,
            height: scale.folderTabH,
            marginLeft: 2,
            width: scale.folderTabW,
            opacity: props.active ? 1 : 0.85,
          },
        ]}
      />
      <View
        style={[
          styles.folderBody,
          {
            height: scale.folderBodyH,
            width: scale.tabWidth,
          },
          props.active
            ? { backgroundColor: color }
            : { borderColor: color, borderWidth: 1.5, backgroundColor: 'transparent' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    height: 0,
    width: 0,
  },
  homeBody: {
    borderRadius: 2,
  },
  folder: {
    justifyContent: 'flex-end',
  },
  folderTab: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  folderBody: {
    borderRadius: 3,
  },
});

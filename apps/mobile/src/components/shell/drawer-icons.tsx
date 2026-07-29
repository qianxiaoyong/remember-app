import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DrawerMenuItemId } from '../../shell/drawer-menu-config';
import { colors } from '../../theme/colors';

interface DrawerMenuIconProps {
  itemId: DrawerMenuItemId;
}

export function DrawerMenuIcon(props: DrawerMenuIconProps): ReactElement {
  const color = colors.textSecondary;

  switch (props.itemId) {
    case 'downloads':
      return (
        <View style={styles.box}>
          <View style={[styles.downloadTray, { borderColor: color }]} />
          <View style={[styles.downloadArrow, { borderTopColor: color }]} />
        </View>
      );
    case 'favorites':
      return (
        <View style={styles.box}>
          <View style={[styles.bookmark, { borderColor: color }]} />
        </View>
      );
    case 'settings':
      return (
        <View style={styles.box}>
          <View style={[styles.settingsRing, { borderColor: color }]} />
          <View style={[styles.settingsDot, { backgroundColor: color }]} />
        </View>
      );
    case 'about':
      return (
        <View style={styles.box}>
          <View style={[styles.aboutRing, { borderColor: color }]}>
            <View style={[styles.aboutMark, { backgroundColor: color }]} />
          </View>
        </View>
      );
    case 'contact':
      return (
        <View style={styles.box}>
          <View style={[styles.chatBubble, { borderColor: color }]} />
        </View>
      );
    default:
      return <View style={styles.box} />;
  }
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  downloadTray: {
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopWidth: 0,
    bottom: 1,
    height: 7,
    position: 'absolute',
    width: 12,
  },
  downloadArrow: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 4,
    borderRightColor: 'transparent',
    borderRightWidth: 4,
    borderTopWidth: 5,
    height: 0,
    position: 'absolute',
    top: 2,
    width: 0,
  },
  bookmark: {
    borderBottomWidth: 0,
    borderColor: colors.textSecondary,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderTopWidth: 1.5,
    height: 12,
    width: 10,
  },
  settingsRing: {
    borderRadius: 6,
    borderWidth: 1.5,
    height: 12,
    width: 12,
  },
  settingsDot: {
    borderRadius: 2,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  aboutRing: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    height: 14,
    justifyContent: 'flex-end',
    width: 14,
  },
  aboutMark: {
    borderRadius: 1,
    height: 5,
    marginBottom: 3,
    width: 1.5,
  },
  chatBubble: {
    borderRadius: 5,
    borderWidth: 1.5,
    height: 11,
    width: 14,
  },
});

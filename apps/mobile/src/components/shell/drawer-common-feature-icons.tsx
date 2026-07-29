import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DrawerCommonFeatureId } from '../../shell/drawer-menu-config';
import { colors } from '../../theme/colors';

interface DrawerCommonFeatureIconProps {
  featureId: DrawerCommonFeatureId;
}

export function DrawerCommonFeatureIcon(props: DrawerCommonFeatureIconProps): ReactElement {
  const color = colors.textPrimary;

  switch (props.featureId) {
    case 'guide':
      return (
        <View style={styles.box}>
          <View style={[styles.compassRing, { borderColor: color }]} />
          <View style={[styles.compassNeedle, { backgroundColor: color }]} />
        </View>
      );
    case 'question-bank':
      return (
        <View style={styles.box}>
          <View style={[styles.bookCover, { borderColor: color }]} />
          <View style={[styles.bookMark, { backgroundColor: color }]} />
        </View>
      );
    case 'redeem':
      return (
        <View style={styles.box}>
          <View style={[styles.ticket, { borderColor: color }]} />
          <View style={[styles.ticketNotch, { backgroundColor: colors.background }]} />
        </View>
      );
    case 'follow':
      return (
        <View style={styles.box}>
          <View style={[styles.followBubble, { borderColor: color }]}>
            <View style={[styles.followEye, { backgroundColor: color }]} />
          </View>
        </View>
      );
    default:
      return <View style={styles.box} />;
  }
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  compassRing: {
    borderRadius: 12,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  compassNeedle: {
    height: 10,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    width: 2,
  },
  bookCover: {
    borderRadius: 2,
    borderWidth: 2,
    height: 20,
    width: 16,
  },
  bookMark: {
    height: 6,
    position: 'absolute',
    right: 5,
    top: 2,
    width: 2,
  },
  ticket: {
    borderRadius: 2,
    borderWidth: 2,
    height: 14,
    width: 22,
  },
  ticketNotch: {
    borderRadius: 2,
    height: 5,
    position: 'absolute',
    right: 5,
    width: 5,
  },
  followBubble: {
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 2,
    height: 17,
    justifyContent: 'center',
    width: 22,
  },
  followEye: {
    borderRadius: 2,
    height: 5,
    width: 8,
  },
});

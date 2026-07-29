import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface MarketSidebarColumnProps {
  collapsed: boolean;
  children: ReactNode;
}

export function MarketSidebarColumn(props: MarketSidebarColumnProps): ReactElement {
  if (props.collapsed) {
    return <View style={styles.collapsedPlaceholder} />;
  }

  return <View style={styles.column}>{props.children}</View>;
}

interface MarketSidebarToggleButtonProps {
  collapsed: boolean;
  onPress: () => void;
}

export function MarketSidebarToggleButton(props: MarketSidebarToggleButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityLabel={props.collapsed ? '展开分类' : '收起分类'}
      accessibilityRole="button"
      onPress={props.onPress}
      style={styles.toggleButton}
    >
      <Text style={styles.toggleIcon}>{props.collapsed ? '›' : '‹'}</Text>
    </Pressable>
  );
}

const SIDEBAR_WIDTH = 88;

const styles = StyleSheet.create({
  column: {
    backgroundColor: '#ECEEF3',
    borderRightColor: colors.borderStrong,
    borderRightWidth: StyleSheet.hairlineWidth,
    width: SIDEBAR_WIDTH,
  },
  collapsedPlaceholder: {
    width: 0,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: '#ECEEF3',
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    height: 32,
    justifyContent: 'center',
    width: 28,
  },
  toggleIcon: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export const MARKET_SIDEBAR_WIDTH = SIDEBAR_WIDTH;

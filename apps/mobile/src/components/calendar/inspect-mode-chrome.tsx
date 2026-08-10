import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface InspectModeChromeProps {
  localDate: string;
  subCategoryLabel: string;
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
}

export function InspectModeHeader(props: {
  localDate: string;
  subCategoryLabel: string;
  index: number;
  total: number;
}): ReactElement {
  const shortDate = props.localDate.slice(5).replace('-', '/');
  return (
    <Text numberOfLines={1} style={styles.headerText}>
      家长检查 · {shortDate} · {props.subCategoryLabel} · {props.index + 1}/{props.total}
    </Text>
  );
}

export function InspectModeNavFloating(props: InspectModeChromeProps): ReactElement {
  return (
    <View pointerEvents="box-none" style={styles.floatingWrap}>
      <View style={styles.floatingBar}>
        <Pressable
          accessibilityLabel="上一条"
          accessibilityRole="button"
          disabled={!props.canPrevious}
          onPress={props.onPrevious}
          style={[styles.navButton, !props.canPrevious ? styles.navButtonDisabled : null]}
        >
          <Text style={styles.navButtonText}>◀</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="下一条"
          accessibilityRole="button"
          disabled={!props.canNext}
          onPress={props.onNext}
          style={[styles.navButton, !props.canNext ? styles.navButtonDisabled : null]}
        >
          <Text style={styles.navButtonText}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  floatingWrap: {
    bottom: spacing.xl,
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
  },
  floatingBar: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  navButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

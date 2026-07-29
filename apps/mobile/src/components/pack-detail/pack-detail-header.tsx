import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleIconButton } from '../ui/circle-icon-button';
import { BackChevronIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailHeaderProps {
  categoryContextLabel: string;
  onBackPress: () => void;
}

export function PackDetailHeader(props: PackDetailHeaderProps): ReactElement {
  return (
    <View style={styles.row}>
      <CircleIconButton accessibilityLabel="返回" onPress={props.onBackPress}>
        <BackChevronIcon size="sm" />
      </CircleIconButton>
      <Text numberOfLines={1} style={styles.context}>
        {props.categoryContextLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  context: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    marginLeft: spacing.md,
    textAlign: 'right',
  },
});

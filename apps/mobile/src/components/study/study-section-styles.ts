import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const studySectionStyles = StyleSheet.create({
  title: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '400',
  },
  titleDivider: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
});

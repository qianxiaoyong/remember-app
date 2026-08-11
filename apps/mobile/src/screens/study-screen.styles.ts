import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const studyScreenStyles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  emptyState: {
    padding: spacing.lg,
  },
  message: {
    color: colors.studyRatingForgot,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  resetMessage: {
    color: colors.studyHeaderBackground,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});

import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReviewRating } from '@remember/domain';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyRatingBarProps {
  labels: Record<ReviewRating, string>;
  disabled?: boolean;
  onRate: (rating: ReviewRating) => void;
}

const RATING_OPTIONS: {
  rating: ReviewRating;
  label: string;
  backgroundColor: string;
}[] = [
  { rating: 'forgot', label: '忘记', backgroundColor: colors.studyRatingForgot },
  { rating: 'hard', label: '模糊', backgroundColor: colors.studyRatingHard },
  { rating: 'good', label: '记得', backgroundColor: colors.studyRatingGood },
];

export function StudyRatingBar(props: StudyRatingBarProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {RATING_OPTIONS.map((option) => (
        <Pressable
          accessibilityRole="button"
          disabled={props.disabled}
          key={option.rating}
          onPress={() => {
            props.onRate(option.rating);
          }}
          style={[
            styles.button,
            { backgroundColor: option.backgroundColor },
            props.disabled ? styles.disabled : null,
          ]}
        >
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.hint}>{props.labels[option.rating]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
    textAlign: 'center',
  },
});

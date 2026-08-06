import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ReviewSettingsSheetProps {
  visible: boolean;
  dailyReviewLimit: number;
  dueTotal: number;
  todayReviewCompleted: number;
  joinedPoolCountToday: number;
  onClose: () => void;
  onChangeDailyLimit: (value: number) => void;
}

export function ReviewSettingsSheet(props: ReviewSettingsSheetProps): ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" onRequestClose={props.onClose} transparent visible={props.visible}>
      <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop}>
        <Pressable
          accessibilityRole="none"
          onPress={() => undefined}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
        >
          <Text style={styles.title}>复习设置</Text>
          <Text style={styles.meta}>
            今日已练 {props.todayReviewCompleted} / 限额 {props.dailyReviewLimit}
          </Text>
          <Text style={styles.meta}>到期共 {props.dueTotal} 词</Text>
          <Text style={styles.meta}>今日新入池 {props.joinedPoolCountToday} 词</Text>

          <View style={styles.limitRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                props.onChangeDailyLimit(props.dailyReviewLimit - 1);
              }}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperLabel}>-</Text>
            </Pressable>
            <Text style={styles.limitValue}>每日复习 {props.dailyReviewLimit} 词</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                props.onChangeDailyLimit(props.dailyReviewLimit + 1);
              }}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperLabel}>+</Text>
            </Pressable>
          </View>

          <PrimaryButton label="完成" onPress={props.onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  limitRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  stepperLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  limitValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});

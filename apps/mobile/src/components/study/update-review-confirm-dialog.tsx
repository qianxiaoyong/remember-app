import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface UpdateReviewConfirmDialogProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function UpdateReviewConfirmDialog(props: UpdateReviewConfirmDialogProps): ReactElement {
  return (
    <Modal animationType="fade" transparent visible={props.visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>更新复习</Text>
          <Text style={styles.body}>
            将用当前学习包的内容替换复习池中的该词，复习进度会清零。
          </Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={props.onCancel} style={styles.cancel}>
              <Text style={styles.cancelLabel}>取消</Text>
            </Pressable>
            <PrimaryButton label="确认更新" onPress={props.onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: spacing.md,
    maxWidth: 360,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'flex-end',
  },
  cancel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelLabel: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});

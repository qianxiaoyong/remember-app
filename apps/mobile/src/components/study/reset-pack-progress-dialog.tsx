import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ResetPackProgressDialogProps {
  visible: boolean;
  packDisplayName: string;
  isReaderMode: boolean;
  inReviewPoolCount: number;
  resetBrowse: boolean;
  resetReview: boolean;
  onToggleBrowse: () => void;
  onToggleReview: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetPackProgressDialog(props: ResetPackProgressDialogProps): ReactElement {
  const browseLabel = props.isReaderMode
    ? '阅读位置（从第一课重新开始）'
    : '浏览位置（从第一个词重新开始）';
  const reviewLabel =
    props.inReviewPoolCount > 0
      ? `复习进度（将本包 ${String(props.inReviewPoolCount)} 个已加复习的词移出复习池）`
      : '复习进度（本包暂无已加复习的词）';
  const canConfirm = props.resetBrowse || props.resetReview;

  return (
    <Modal animationType="fade" transparent visible={props.visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>重置{props.isReaderMode ? '阅读' : '学习'}进度</Text>
          <Text style={styles.body}>
            重置《{props.packDisplayName}》的本地进度，此操作不可恢复。
          </Text>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: props.resetBrowse }}
            onPress={props.onToggleBrowse}
            style={styles.optionRow}
          >
            <Text style={styles.checkbox}>{props.resetBrowse ? '☑' : '☐'}</Text>
            <Text style={styles.optionLabel}>{browseLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{
              checked: props.resetReview,
              disabled: props.inReviewPoolCount === 0,
            }}
            disabled={props.inReviewPoolCount === 0}
            onPress={props.onToggleReview}
            style={[styles.optionRow, props.inReviewPoolCount === 0 ? styles.optionDisabled : null]}
          >
            <Text style={styles.checkbox}>{props.resetReview ? '☑' : '☐'}</Text>
            <Text style={styles.optionLabel}>{reviewLabel}</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={props.onCancel} style={styles.cancel}>
              <Text style={styles.cancelLabel}>取消</Text>
            </Pressable>
            <PrimaryButton disabled={!canConfirm} label="确认重置" onPress={props.onConfirm} />
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
  optionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    color: colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    width: 24,
  },
  optionLabel: {
    color: colors.textPrimary,
    flex: 1,
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

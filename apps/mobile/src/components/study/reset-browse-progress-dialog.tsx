import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ResetBrowseProgressDialogProps {
  visible: boolean;
  packDisplayName: string;
  isReaderMode: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetBrowseProgressDialog(props: ResetBrowseProgressDialogProps): ReactElement {
  const body = props.isReaderMode
    ? `将清除《${props.packDisplayName}》的阅读书签，下次从第一课开始。复习池中的词条不会受影响。`
    : `将清除《${props.packDisplayName}》的浏览书签，下次从第一个词开始。复习池中的词条不会受影响。`;

  return (
    <Modal animationType="fade" transparent visible={props.visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>重置{props.isReaderMode ? '阅读' : '浏览'}位置</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={props.onCancel} style={styles.cancel}>
              <Text style={styles.cancelLabel}>取消</Text>
            </Pressable>
            <PrimaryButton label="确认重置" onPress={props.onConfirm} />
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

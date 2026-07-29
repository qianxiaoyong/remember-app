import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { cardShadow } from '../../theme/shadows';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface MiniNoticeProps {
  visible: boolean;
  message: string;
  onClose: () => void;
}

export function MiniNotice(props: MiniNoticeProps): ReactElement {
  useEffect(() => {
    if (!props.visible) {
      return;
    }
    const timer = setTimeout(props.onClose, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, [props.onClose, props.visible]);

  return (
    <Modal animationType="fade" onRequestClose={props.onClose} transparent visible={props.visible}>
      <Pressable accessibilityRole="button" onPress={props.onClose} style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.message}>{props.message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxWidth: 280,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...cardShadow,
  },
  message: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
});

import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../../components/ui/primary-button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface UnsupportedCardPanelProps {
  message?: string;
  onGoHome: () => void;
}

export function UnsupportedCardPanel(props: UnsupportedCardPanelProps): ReactElement {
  return (
    <View style={styles.root}>
      <Text style={styles.message}>{props.message ?? '暂不支持此卡片类型'}</Text>
      <PrimaryButton label="返回书库" onPress={props.onGoHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
});

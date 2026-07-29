import type { ReactElement } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SearchIcon } from '../ui/shell-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SearchTopBarProps {
  onCancel: () => void;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SearchTopBar(props: SearchTopBarProps): ReactElement {
  return (
    <View style={styles.row}>
      <View style={styles.inputWrap}>
        <SearchIcon size="sm" />
        <TextInput
          autoFocus
          clearButtonMode="never"
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          style={styles.input}
          value={props.value}
        />
        {props.value.length > 0 ? (
          <Pressable
            accessibilityLabel="清除搜索"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              props.onChangeText('');
            }}
            style={styles.clearButton}
          >
            <Text style={styles.clearLabel}>×</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={props.onCancel} style={styles.cancel}>
        <Text style={styles.cancelLabel}>取消</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderStrong,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: '#202228',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
    }),
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  clearLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 16,
  },
  cancel: {
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  cancelLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
});

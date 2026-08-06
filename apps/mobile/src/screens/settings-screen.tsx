import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import {
  getPackOpenPosition,
  PREFERENCE_PACK_OPEN_POSITION,
  setUserPreference,
  type PackOpenPosition,
} from '../data/repositories/user-preferences-repository';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SettingsScreen(): ReactElement {
  const router = useRouter();
  const openPosition = getPackOpenPosition();

  const handleSelect = (value: PackOpenPosition): void => {
    setUserPreference({
      key: PREFERENCE_PACK_OPEN_POSITION,
      value,
      updatedAt: new Date().toISOString(),
    });
    router.replace('/settings');
  };

  return (
    <ScreenScaffold>
      <AppHeader
        onBackPress={() => {
          router.back();
        }}
        variant="back"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>基础设置</Text>
        <Text style={styles.sectionTitle}>打开学习包时</Text>
        <View style={styles.optionGroup}>
          <OptionRow
            label="从书签继续"
            selected={openPosition === 'bookmark'}
            onPress={() => {
              handleSelect('bookmark');
            }}
          />
          <OptionRow
            label="从开头开始"
            selected={openPosition === 'start'}
            onPress={() => {
              handleSelect('start');
            }}
          />
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

function OptionRow(props: { label: string; selected: boolean; onPress: () => void }): ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={props.onPress} style={styles.optionRow}>
      <Text style={styles.optionLabel}>{props.label}</Text>
      <Text style={styles.optionMark}>{props.selected ? '●' : '○'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  optionMark: {
    color: colors.accent,
    fontSize: 16,
  },
});

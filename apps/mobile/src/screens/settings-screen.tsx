import type { ReactElement } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../components/shell/app-header';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import {
  getPackOpenPosition,
  getRecallAutoPlayCount,
  PREFERENCE_PACK_OPEN_POSITION,
  PREFERENCE_RECALL_AUTO_PLAY,
  RECALL_AUTO_PLAY_COUNTS,
  setUserPreference,
  type PackOpenPosition,
  type RecallAutoPlayCount,
} from '../data/repositories/user-preferences-repository';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SettingsScreen(): ReactElement {
  const router = useRouter();
  const [openPosition, setOpenPosition] = useState<PackOpenPosition>(() => getPackOpenPosition());
  const [recallAutoPlayCount, setRecallAutoPlayCount] = useState(() => getRecallAutoPlayCount());

  const handleSelectOpenPosition = (value: PackOpenPosition): void => {
    setUserPreference({
      key: PREFERENCE_PACK_OPEN_POSITION,
      value,
      updatedAt: new Date().toISOString(),
    });
    setOpenPosition(value);
  };

  const handleSelectRecallAutoPlayCount = (count: number): void => {
    setUserPreference({
      key: PREFERENCE_RECALL_AUTO_PLAY,
      value: String(count),
      updatedAt: new Date().toISOString(),
    });
    setRecallAutoPlayCount(count);
  };

  const recallAutoPlayEnabled = recallAutoPlayCount > 0;

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
              handleSelectOpenPosition('bookmark');
            }}
          />
          <OptionRow
            label="从开头开始"
            selected={openPosition === 'start'}
            onPress={() => {
              handleSelectOpenPosition('start');
            }}
          />
        </View>
        <Text style={styles.sectionTitle}>回忆页自动发音</Text>
        <View style={styles.optionGroup}>
          <View style={styles.optionBlock}>
            <OptionRow
              embedded
              label="开启"
              selected={recallAutoPlayEnabled}
              onPress={() => {
                if (!recallAutoPlayEnabled) {
                  handleSelectRecallAutoPlayCount(2);
                }
              }}
            />
            {recallAutoPlayEnabled ? (
              <View style={styles.countRow}>
                <Text style={styles.countLabel}>发音次数</Text>
                <View style={styles.countChips}>
                  {RECALL_AUTO_PLAY_COUNTS.map((count) => (
                    <CountChip
                      key={count}
                      count={count}
                      selected={recallAutoPlayCount === count}
                      onPress={() => {
                        handleSelectRecallAutoPlayCount(count);
                      }}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
          <OptionRow
            label="关闭"
            selected={!recallAutoPlayEnabled}
            onPress={() => {
              handleSelectRecallAutoPlayCount(0);
            }}
          />
        </View>
      </ScrollView>
    </ScreenScaffold>
  );
}

function OptionRow(props: {
  label: string;
  selected: boolean;
  onPress: () => void;
  embedded?: boolean;
}): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={[styles.optionRow, props.embedded ? null : styles.optionRowStandalone]}
    >
      <Text style={styles.optionLabel}>{props.label}</Text>
      <Text style={styles.optionMark}>{props.selected ? '●' : '○'}</Text>
    </Pressable>
  );
}

function CountChip(props: {
  count: RecallAutoPlayCount;
  selected: boolean;
  onPress: () => void;
}): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
      onPress={props.onPress}
      style={[styles.countChip, props.selected ? styles.countChipSelected : null]}
    >
      <Text style={[styles.countChipText, props.selected ? styles.countChipTextSelected : null]}>
        {props.count}
      </Text>
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
    marginTop: spacing.md,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionRowStandalone: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingRight: spacing.sm,
  },
  optionMark: {
    color: colors.accent,
    fontSize: 16,
  },
  countRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  countLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  countChips: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'flex-end',
  },
  countChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    minWidth: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  countChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  countChipText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  countChipTextSelected: {
    color: colors.surface,
  },
});

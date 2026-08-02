import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export type StoryLessonTabId = 'read' | 'vocab';

interface StoryLessonTabOption {
  id: StoryLessonTabId;
  label: string;
}

const STORY_LESSON_TABS: StoryLessonTabOption[] = [
  { id: 'read', label: '原文' },
  { id: 'vocab', label: '本课词' },
];

interface StoryLessonTabsProps {
  activeTab: StoryLessonTabId;
  vocabCount: number;
  onChange: (tab: StoryLessonTabId) => void;
  variant?: 'bar' | 'toolbar';
}

export function StoryLessonTabs(props: StoryLessonTabsProps): ReactElement {
  const isToolbar = props.variant === 'toolbar';

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, isToolbar ? styles.rowToolbar : null]}>
        {STORY_LESSON_TABS.map((option) => {
          const isActive = props.activeTab === option.id;
          const label = option.id === 'vocab' ? `本课词${String(props.vocabCount)}` : option.label;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              hitSlop={8}
              key={option.id}
              onPress={() => {
                props.onChange(option.id);
              }}
              style={[styles.tab, isToolbar ? styles.tabToolbar : null]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isToolbar ? styles.labelToolbar : null,
                  isActive ? styles.labelActive : null,
                ]}
              >
                {label}
              </Text>
              {isActive ? (
                <View style={styles.underline} />
              ) : (
                <View style={styles.underlinePlaceholder} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.lg,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  rowToolbar: {
    gap: spacing.md,
    justifyContent: 'center',
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  tabToolbar: {
    minWidth: 44,
    paddingHorizontal: spacing.xs,
  },
  label: {
    color: colors.tabInactive,
    fontSize: 15,
    lineHeight: 20,
  },
  labelToolbar: {
    fontSize: 14,
    lineHeight: 18,
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  underline: {
    backgroundColor: colors.accent,
    borderRadius: 2,
    height: 3,
    marginTop: spacing.xs,
    width: 24,
  },
  underlinePlaceholder: {
    height: 3,
    marginTop: spacing.xs,
    width: 24,
  },
});

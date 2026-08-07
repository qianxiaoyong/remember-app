import type { ReactElement } from 'react';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StorySidebarEntry } from '@remember/contracts';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { StoryVocabSheet } from './story-vocab-sheet';
import { tierAccentColor } from './tier-colors';

interface StoryVocabPanelProps {
  sidebar: StorySidebarEntry[];
  packId?: string | undefined;
}

export function StoryVocabPanel(props: StoryVocabPanelProps): ReactElement {
  const [selectedEntry, setSelectedEntry] = useState<StorySidebarEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.root}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={props.sidebar}
        keyExtractor={(item) => item.vocabId}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSelectedEntry(item);
              setSheetVisible(true);
            }}
            style={styles.row}
          >
            <View style={[styles.tierDot, { backgroundColor: tierAccentColor(item.tier) }]} />
            <View style={styles.rowMain}>
              <Text style={styles.headword}>{item.headword}</Text>
              <Text style={styles.meta}>
                {item.pos} {item.ipa}
              </Text>
              <Text style={styles.definition}>{item.definitionZh}</Text>
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />

      <StoryVocabSheet
        entry={selectedEntry}
        onClose={() => {
          setSheetVisible(false);
          setSelectedEntry(null);
        }}
        packId={props.packId}
        visible={sheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  tierDot: {
    borderRadius: 4,
    height: 32,
    marginRight: spacing.md,
    width: 4,
  },
  rowMain: {
    flex: 1,
  },
  headword: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  definition: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.xs,
  },
});

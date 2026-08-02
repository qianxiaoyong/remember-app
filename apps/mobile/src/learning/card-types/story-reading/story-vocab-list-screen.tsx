import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StorySidebarEntry } from '@remember/contracts';
import { ScreenScaffold } from '../../../components/shell/screen-scaffold';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { BackChevronIcon } from '../../../components/ui/shell-icons';
import { tierAccentColor } from './tier-colors';
import { StoryVocabSheet } from './story-vocab-sheet';
import { getPackCardDetailUseCase } from '../../../use-cases/get-pack-card-detail';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export function StoryVocabListScreen(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    packId?: string | string[];
    knowledgeId?: string | string[];
  }>();
  const packId = Array.isArray(params.packId) ? params.packId[0] : params.packId;
  const knowledgeId = Array.isArray(params.knowledgeId)
    ? params.knowledgeId[0]
    : params.knowledgeId;
  const [selectedEntry, setSelectedEntry] = useState<StorySidebarEntry | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const sidebar = useMemo((): StorySidebarEntry[] => {
    if (!packId || !knowledgeId) {
      return [];
    }
    const detail = getPackCardDetailUseCase(packId, knowledgeId);
    if (detail?.cardType !== 'story_reading') {
      return [];
    }
    return detail.content.sidebar;
  }, [knowledgeId, packId]);

  return (
    <ScreenScaffold safeAreaEdges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <CircleIconButton
          accessibilityLabel="返回"
          onPress={() => {
            router.back();
          }}
        >
          <BackChevronIcon size="sm" />
        </CircleIconButton>
        <Text style={styles.title}>本课 {sidebar.length} 词</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={sidebar}
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
      />

      <StoryVocabSheet
        entry={selectedEntry}
        onClose={() => {
          setSheetVisible(false);
          setSelectedEntry(null);
        }}
        visible={sheetVisible}
      />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  headerSpacer: {
    width: spacing.touchTarget,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
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

import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StorySidebarEntry } from '@remember/contracts';
import { ScreenScaffold } from '../../../components/shell/screen-scaffold';
import { CircleIconButton } from '../../../components/ui/circle-icon-button';
import { AppIcon } from '../../../components/ui/app-icon';
import { StoryVocabPanel } from './story-vocab-panel';
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
          <AppIcon color={colors.textPrimary} name="chevron-back" size="sm" />
        </CircleIconButton>
        <Text style={styles.title}>本课 {sidebar.length} 词</Text>
        <View style={styles.headerSpacer} />
      </View>

      <StoryVocabPanel packId={packId} sidebar={sidebar} />
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
});

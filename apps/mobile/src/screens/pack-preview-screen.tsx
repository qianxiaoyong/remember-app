import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { StudyHeaderBand } from '../components/study/study-header-band';
import { StudyRevealScrollBody } from '../components/study/study-reveal-scroll-body';
import { getPackDetailViewModel } from '../use-cases/get-pack-detail-view-model';
import { mapSamplePreviewToVocabularyContent } from '../use-cases/map-sample-preview-to-vocabulary-content';
import { playSamplePreviewAudio } from '../use-cases/play-sample-preview-audio';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface PackPreviewScreenProps {
  packId: string;
  headword: string;
}

export function PackPreviewScreen(props: PackPreviewScreenProps): ReactElement {
  const router = useRouter();
  const [sample, setSample] = useState<PackSamplePreview | null>(null);
  const [packTitle, setPackTitle] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const viewModel = await getPackDetailViewModel(props.packId);
    if (!viewModel) {
      setSample(null);
      setIsLoading(false);
      return;
    }
    const matched =
      viewModel.samplePreviews.find((item) => item.headword === props.headword) ?? null;
    setSample(matched);
    setPackTitle(viewModel.title);
    setIsInstalled(viewModel.isInstalled);
    setIsLoading(false);
  }, [props.headword, props.packId]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const vocabularyContent = useMemo(
    () => (sample ? mapSamplePreviewToVocabularyContent(sample) : null),
    [sample],
  );

  const handlePlayAudio = (): void => {
    if (!sample) {
      return;
    }
    void (async () => {
      try {
        const result = await playSamplePreviewAudio({
          packId: props.packId,
          isInstalled,
          sample,
        });
        if (result === 'no-audio' || result === 'missing-file') {
          Alert.alert('暂无公开试听');
          return;
        }
        if (result === 'failed') {
          Alert.alert('发音播放失败', '请重新安装该学习包后重试。');
        }
      } catch {
        Alert.alert('发音播放失败', '请重新安装该学习包后重试。');
      }
    })();
  };

  if (isLoading) {
    return (
      <ScreenScaffold>
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </ScreenScaffold>
    );
  }

  if (!sample || !vocabularyContent) {
    return (
      <ScreenScaffold>
        <View style={styles.center}>
          <Text style={styles.empty}>未找到该示例</Text>
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold>
      <StudyHeaderBand
        content={vocabularyContent}
        onBackPress={() => {
          router.back();
        }}
        onHomePress={() => undefined}
        onMorePress={() => undefined}
        onPlayAudio={handlePlayAudio}
        previewContextLabel={packTitle}
        revealed
        toolbarVariant="preview"
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <StudyRevealScrollBody
          content={vocabularyContent}
          onPlayExampleAudio={() => {
            Alert.alert('预览暂无例句发音');
          }}
          onTokenPress={() => {
            Alert.alert('预览不支持点词');
          }}
        />
        <Text style={styles.hint}>预览不计入学习进度</Text>
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});

import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import { markPackMockPurchased } from '../catalog/mock-purchase-store';
import { PackDetailActionBar } from '../components/pack-detail/pack-detail-action-bar';
import { PackDetailHeader } from '../components/pack-detail/pack-detail-header';
import { PackDetailHeroCard } from '../components/pack-detail/pack-detail-hero-card';
import { PackDetailIncludedSection } from '../components/pack-detail/pack-detail-included-section';
import { PackDetailSampleList } from '../components/pack-detail/pack-detail-sample-list';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import {
  getPackDetailViewModel,
  type PackDetailViewModel,
} from '../use-cases/get-pack-detail-view-model';
import { installBundledTestPack } from '../use-cases/install-bundled-test-pack';
import { playPackAssetAudio } from '../use-cases/play-pack-asset-audio';
import { resolvePackSamplePreviewPlay } from '../use-cases/resolve-pack-sample-preview-play';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface PackDetailScreenProps {
  packId: string;
}

export function PackDetailScreen(props: PackDetailScreenProps): ReactElement {
  const router = useRouter();
  const [viewModel, setViewModel] = useState<PackDetailViewModel | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getPackDetailViewModel(props.packId);
    setViewModel(next);
  }, [props.packId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handlePrimaryAction = async (): Promise<void> => {
    if (!viewModel) {
      return;
    }
    setMessage(null);
    setIsBusy(true);
    try {
      if (viewModel.actionKind === 'purchase') {
        Alert.alert('阶段 6 开放', '正式购买与微信支付将在后续版本提供。', [
          { text: '取消', style: 'cancel' },
          {
            text: '模拟已购买',
            onPress: () => {
              void (async () => {
                await markPackMockPurchased(viewModel.packId);
                await refresh();
                setMessage('已模拟购买，可进行安装测试');
              })();
            },
          },
        ]);
        return;
      }

      if (viewModel.actionKind === 'install') {
        if (!viewModel.isBundledTestPack) {
          setMessage('当前仅支持安装内置测试包');
          return;
        }
        await installBundledTestPack(viewModel.packId);
        markLibraryNeedsRefresh();
        await refresh();
        setMessage('安装成功');
        return;
      }

      router.push(`/study?packId=${viewModel.packId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '操作失败');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePlaySample = (sample: PackSamplePreview): void => {
    if (!viewModel) {
      return;
    }

    void (async () => {
      const result = await resolvePackSamplePreviewPlay({
        packId: viewModel.packId,
        isInstalled: viewModel.isInstalled,
        ...(sample.previewAudio ? { previewAudio: sample.previewAudio } : {}),
      });

      if (result === 'not-installed') {
        Alert.alert('安装后可试听示例');
        return;
      }
      if (result === 'no-audio') {
        Alert.alert('暂无示例发音');
        return;
      }
      if (result === 'missing-file') {
        Alert.alert('示例发音文件缺失');
        return;
      }
      if (!sample.previewAudio) {
        Alert.alert('暂无示例发音');
        return;
      }
      const playResult = await playPackAssetAudio({
        packId: viewModel.packId,
        relativePath: sample.previewAudio,
      });
      if (playResult === 'failed') {
        Alert.alert('示例发音播放失败');
      }
    })();
  };

  if (!viewModel) {
    return (
      <ScreenScaffold>
        <PackDetailHeader
          categoryContextLabel=""
          onBackPress={() => {
            router.back();
          }}
        />
        <View style={styles.center}>
          <Text style={styles.empty}>未找到该知识库</Text>
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      footer={
        <PackDetailActionBar
          actionLabel={viewModel.actionLabel}
          isBusy={isBusy}
          mockPriceLabel={viewModel.mockPriceLabel}
          purchaseHint={viewModel.purchaseHint}
          onActionPress={() => {
            void handlePrimaryAction();
          }}
        />
      }
    >
      <PackDetailHeader
        categoryContextLabel={viewModel.categoryContextLabel}
        onBackPress={() => {
          router.back();
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PackDetailHeroCard
          cardCount={viewModel.cardCount}
          contentTags={viewModel.contentTags}
          cover={viewModel.cover}
          formattedUpdatedAt={viewModel.formattedUpdatedAt}
          sizeLabel={viewModel.sizeLabel}
          summary={viewModel.summary}
          title={viewModel.title}
        />
        <PackDetailIncludedSection subtitle={viewModel.includedSubtitle} />
        <PackDetailSampleList onPlaySample={handlePlaySample} samples={viewModel.samplePreviews} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

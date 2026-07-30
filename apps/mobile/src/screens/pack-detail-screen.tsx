import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PackSamplePreview } from '../catalog/pack-sample-preview';
import { PackDetailActionBar } from '../components/pack-detail/pack-detail-action-bar';
import { PackDetailHeader } from '../components/pack-detail/pack-detail-header';
import { PackDetailHeroCard } from '../components/pack-detail/pack-detail-hero-card';
import { PackDetailIncludedSection } from '../components/pack-detail/pack-detail-included-section';
import { PackDetailIntroMedia } from '../components/pack-detail/pack-detail-intro-media';
import { PackDetailSampleList } from '../components/pack-detail/pack-detail-sample-list';
import { ScreenScaffold } from '../components/shell/screen-scaffold';
import { markLibraryNeedsRefresh } from '../shell/library-refresh-signal';
import {
  getPackDetailViewModel,
  type PackDetailViewModel,
} from '../use-cases/get-pack-detail-view-model';
import { installBundledTestPack } from '../use-cases/install-bundled-test-pack';
import { playSamplePreviewAudio } from '../use-cases/play-sample-preview-audio';
import { uninstallInstalledPack } from '../use-cases/uninstall-installed-pack';
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
        Alert.alert('即将开放', '微信支付将在后续版本提供，您也可通过抽屉「兑换码」开通。');
        return;
      }

      if (viewModel.actionKind === 'install') {
        if (!viewModel.isBundledTestPack) {
          setMessage('网络下载安装将在后续版本提供');
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

  const handleUninstall = (): void => {
    if (!viewModel?.isInstalled) {
      return;
    }

    Alert.alert('卸载知识库', '将移除此包的本地文件；学习进度会保留，重新安装后可恢复。', [
      { text: '取消', style: 'cancel' },
      {
        text: '卸载',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setMessage(null);
            setIsBusy(true);
            try {
              await uninstallInstalledPack(viewModel.packId);
              markLibraryNeedsRefresh();
              await refresh();
              setMessage('已卸载');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : '卸载失败');
            } finally {
              setIsBusy(false);
            }
          })();
        },
      },
    ]);
  };

  const handlePlaySample = (sample: PackSamplePreview): void => {
    if (!viewModel) {
      return;
    }

    void (async () => {
      const result = await playSamplePreviewAudio({
        packId: viewModel.packId,
        isInstalled: viewModel.isInstalled,
        sample,
      });

      if (result === 'no-audio') {
        Alert.alert('暂无示例发音');
        return;
      }
      if (result === 'missing-file') {
        Alert.alert('安装后可试听此示例', '公开试听请进入预览页。');
        return;
      }
      if (result === 'failed') {
        Alert.alert('示例发音播放失败');
      }
    })();
  };

  const handleOpenPreview = (sample: PackSamplePreview): void => {
    if (!viewModel) {
      return;
    }
    router.push(
      `/pack-preview?packId=${encodeURIComponent(viewModel.packId)}&headword=${encodeURIComponent(sample.headword)}`,
    );
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
          priceLabel={viewModel.priceLabel}
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
        <PackDetailIntroMedia items={viewModel.introMedia} />
        <PackDetailIncludedSection subtitle={viewModel.includedSubtitle} />
        <PackDetailSampleList
          onOpenPreview={handleOpenPreview}
          onPlaySample={handlePlaySample}
          samples={viewModel.samplePreviews}
        />
        {viewModel.isInstalled ? (
          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={handleUninstall}
            style={styles.uninstallButton}
          >
            <Text style={styles.uninstallLabel}>卸载此知识库</Text>
          </Pressable>
        ) : null}
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
  uninstallButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
  },
  uninstallLabel: {
    color: colors.studyRatingForgot,
    fontSize: 14,
    fontWeight: '500',
  },
});

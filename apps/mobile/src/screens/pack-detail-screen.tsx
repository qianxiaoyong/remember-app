import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { findCatalogItemOffline } from '../data/catalog/catalog-cache-store';
import { readSessionToken } from '../data/session/session-store';
import {
  getPackDetailViewModel,
  getPackDetailViewModelFromCatalogItem,
  type PackDetailViewModel,
} from '../use-cases/get-pack-detail-view-model';
import { installPackFromNetwork } from '../use-cases/install-pack-from-network';
import { mapPackInstallError } from '../use-cases/map-pack-install-error';
import { isAuthRequiredError } from '../use-cases/auth-required-error';
import { purchasePackWithMockPayment } from '../use-cases/purchase-pack-with-mock-payment';
import { isMockPaymentEnabled } from '../config/mock-payment-enabled';
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
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const offlineItem = await findCatalogItemOffline(props.packId);
      if (offlineItem) {
        setViewModel(await getPackDetailViewModelFromCatalogItem(props.packId, offlineItem));
      }

      const next = await getPackDetailViewModel(props.packId);
      setViewModel(next);
    } finally {
      setIsLoading(false);
    }
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
      if (viewModel.actionKind === 'retry_access') {
        await refresh();
        return;
      }

      if (viewModel.actionKind === 'purchase') {
        const token = await readSessionToken();
        if (!token) {
          promptLoginForPackAction('purchase', viewModel.packId, router.push);
          return;
        }
        if (isMockPaymentEnabled()) {
          const result = await purchasePackWithMockPayment(viewModel.packId);
          await refresh();
          setMessage(result === 'paid' ? '模拟支付成功，可点击安装' : '订单待支付');
          return;
        }
        Alert.alert('即将开放', '微信支付将在后续版本提供，您也可通过抽屉「兑换码」开通。');
        return;
      }

      if (viewModel.actionKind === 'install' || viewModel.actionKind === 'update') {
        await installPackFromNetwork(viewModel.packId);
        markLibraryNeedsRefresh();
        await refresh();
        setMessage(viewModel.actionKind === 'update' ? '更新成功' : '安装成功');
        return;
      }

      router.push(`/study?packId=${viewModel.packId}`);
    } catch (error) {
      if (isAuthRequiredError(error)) {
        promptLoginForPackAction(viewModel.actionKind, viewModel.packId, router.push);
        return;
      }
      setMessage(mapPackInstallError(error).message);
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
          {isLoading ? (
            <>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text style={styles.loadingHint}>正在加载知识库…</Text>
            </>
          ) : (
            <Text style={styles.empty}>未找到该知识库</Text>
          )}
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
        <PackDetailIncludedSection
          highlights={viewModel.includedHighlights}
          subtitle={viewModel.includedSubtitle}
        />
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

function promptLoginForPackAction(
  actionKind: PackDetailViewModel['actionKind'],
  packId: string,
  pushRoute: (path: string) => void,
): void {
  const isPurchase = actionKind === 'purchase';
  const returnTo = encodeURIComponent(`/pack/${packId}`);

  Alert.alert(
    '需要登录',
    isPurchase
      ? '购买知识库需要先登录账号，登录后可继续购买。'
      : '安装网络学习包需要先登录账号，登录后可继续安装。',
    [
      { text: '取消', style: 'cancel' },
      {
        text: '去登录',
        onPress: () => {
          pushRoute(`/login?returnTo=${returnTo}`);
        },
      },
    ],
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
    gap: spacing.md,
    justifyContent: 'center',
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  loadingHint: {
    color: colors.textSecondary,
    fontSize: 14,
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

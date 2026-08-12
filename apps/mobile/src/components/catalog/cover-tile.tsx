import type { ReactElement } from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import {
  CATALOG_COVER_BORDER_RADIUS,
  CATALOG_COVER_DETAIL_ICON_SIZE,
  catalogCoverHeight,
} from '../../catalog/catalog-cover-layout';
import { ProgressBar } from '../ui/progress-bar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type CoverTileProgressVariant = 'default' | 'shelf';

interface CoverTileProps {
  source: ImageSourcePropType;
  width: number;
  /** 横滑大封面等场景需居中；网格默认靠左。 */
  align?: 'start' | 'center';
  accessibilityLabel?: string;
  progress?: number;
  progressText?: string;
  progressHint?: string;
  progressColor?: string;
  progressVariant?: CoverTileProgressVariant;
  onPress?: () => void;
  onDetailPress?: () => void;
}

const PROGRESS_VARIANTS: Record<
  CoverTileProgressVariant,
  {
    barHeight: number;
    overlayGap: number;
    overlayPaddingVertical: number;
    progressFontSize: number;
    hintFontSize: number;
  }
> = {
  default: {
    barHeight: 4,
    overlayGap: 3,
    overlayPaddingVertical: spacing.xs,
    progressFontSize: 10,
    hintFontSize: 9,
  },
  shelf: {
    barHeight: 8,
    overlayGap: spacing.sm,
    overlayPaddingVertical: spacing.md,
    progressFontSize: 14,
    hintFontSize: 13,
  },
};

export function CoverTile(props: CoverTileProps): ReactElement {
  const height = catalogCoverHeight(props.width);
  const align = props.align ?? 'start';
  const progressVariant = props.progressVariant ?? 'default';
  const progressStyles = PROGRESS_VARIANTS[progressVariant];
  const showProgress =
    props.progress !== undefined &&
    props.progressText !== undefined &&
    props.progressColor !== undefined;
  const showProgressHint =
    showProgress && props.progressHint !== undefined && props.progressHint.length > 0;
  const showDetail = props.onDetailPress !== undefined;

  const coverBody = (
    <ImageBackground
      imageStyle={styles.image}
      resizeMode="cover"
      source={props.source}
      style={[styles.cover, { height, width: props.width }]}
    >
      {showDetail ? (
        <Pressable
          accessibilityLabel="查看详情"
          accessibilityRole="button"
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            props.onDetailPress?.();
          }}
          style={styles.detailButton}
        >
          <Text style={styles.detailGlyph}>详</Text>
        </Pressable>
      ) : null}
      {showProgress ? (
        <View
          style={[
            styles.progressOverlay,
            progressVariant === 'shelf' ? styles.progressOverlayShelf : null,
            {
              gap: progressStyles.overlayGap,
              paddingVertical: progressStyles.overlayPaddingVertical,
            },
          ]}
        >
          <ProgressBar
            color={props.progressColor ?? colors.accent}
            height={progressStyles.barHeight}
            progress={props.progress ?? 0}
          />
          <View style={styles.progressTextRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.progressText,
                {
                  fontSize: progressStyles.progressFontSize,
                  lineHeight: progressStyles.progressFontSize + 4,
                },
              ]}
            >
              {props.progressText}
            </Text>
            {showProgressHint ? (
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={[
                  styles.progressHint,
                  {
                    fontSize: progressStyles.hintFontSize,
                    lineHeight: progressStyles.hintFontSize + 4,
                  },
                ]}
              >
                {props.progressHint}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </ImageBackground>
  );

  const rootStyle = align === 'center' ? styles.rootCenter : styles.rootStart;

  if (props.onPress) {
    return (
      <Pressable
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole="button"
        onPress={props.onPress}
        style={rootStyle}
      >
        {coverBody}
      </Pressable>
    );
  }

  return <View style={rootStyle}>{coverBody}</View>;
}

const styles = StyleSheet.create({
  rootStart: {
    alignSelf: 'flex-start',
  },
  rootCenter: {
    alignSelf: 'center',
  },
  cover: {
    borderRadius: CATALOG_COVER_BORDER_RADIUS,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  detailButton: {
    alignItems: 'center',
    backgroundColor: colors.statTileBackground,
    borderRadius: CATALOG_COVER_DETAIL_ICON_SIZE / 2,
    height: CATALOG_COVER_DETAIL_ICON_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: CATALOG_COVER_DETAIL_ICON_SIZE,
    zIndex: 1,
  },
  detailGlyph: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '400',
  },
  progressOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  progressOverlayShelf: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  progressTextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  progressText: {
    color: colors.surface,
    flexShrink: 0,
    fontWeight: '600',
    lineHeight: 14,
  },
  progressHint: {
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'right',
  },
});

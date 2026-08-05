import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { VocabularyContent } from '@remember/contracts';
import { CircleIconButton } from '../ui/circle-icon-button';
import { AppIcon } from '../ui/app-icon';
import { StudyDefinitionStrip } from './study-definition-strip';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyHeaderBandProps {
  content: VocabularyContent;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayAudio: () => void;
  revealed: boolean;
  /** 预览页：左侧返回、隐藏更多 */
  toolbarVariant?: 'study' | 'preview';
  onBackPress?: () => void;
  previewContextLabel?: string;
}

export function StudyHeaderBand(props: StudyHeaderBandProps): ReactElement {
  const insets = useSafeAreaInsets();
  const { prompt } = props.content;
  const dialectLabel = prompt.phonetic?.dialect === 'uk' ? '英' : '美';
  const isPreview = props.toolbarVariant === 'preview';

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.sm },
        props.revealed ? styles.rootRevealed : null,
      ]}
    >
      <View style={styles.toolbar}>
        {isPreview ? (
          <>
            <CircleIconButton
              accessibilityLabel="返回"
              onPress={() => {
                props.onBackPress?.();
              }}
            >
              <AppIcon color={colors.textPrimary} name="chevron-back" size="sm" />
            </CircleIconButton>
            <Text numberOfLines={1} style={styles.previewContext}>
              {props.previewContextLabel ?? '内容预览'}
            </Text>
            <View style={styles.toolbarSpacer} />
          </>
        ) : (
          <>
            <CircleIconButton accessibilityLabel="返回首页" onPress={props.onHomePress}>
              <AppIcon color={colors.textPrimary} name="home-outline" size="sm" />
            </CircleIconButton>
            <CircleIconButton accessibilityLabel="更多" onPress={props.onMorePress}>
              <AppIcon color={colors.textPrimary} name="ellipsis-vertical" size="sm" />
            </CircleIconButton>
          </>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={props.onPlayAudio}
        style={styles.headwordPressable}
      >
        <Text style={styles.headword}>{prompt.headword}</Text>
      </Pressable>

      <Pressable
        accessibilityLabel="播放发音"
        accessibilityRole="button"
        hitSlop={8}
        onPress={props.onPlayAudio}
        style={styles.phoneticRow}
      >
        {prompt.phonetic ? (
          <>
            <Text style={styles.dialectBadge}>{dialectLabel}</Text>
            <Text style={styles.phonetic}>{prompt.phonetic.ipa}</Text>
          </>
        ) : null}
        <View style={styles.speakerBadge}>
          <AppIcon color={colors.studyHeaderBackground} name="volume-high-outline" size="sm" />
        </View>
      </Pressable>

      {props.revealed ? (
        <>
          <View style={styles.definitionDivider} />
          <StudyDefinitionStrip content={props.content} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: colors.studyHeaderBackground,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  rootRevealed: {
    paddingBottom: spacing.lg,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: spacing.touchTarget,
    width: '100%',
  },
  toolbarSpacer: {
    width: spacing.touchTarget,
  },
  previewContext: {
    color: 'rgba(255, 255, 255, 0.88)',
    flex: 1,
    fontSize: 13,
    marginHorizontal: spacing.sm,
    textAlign: 'center',
  },
  headwordPressable: {
    alignItems: 'center',
  },
  headword: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 42,
    textAlign: 'center',
  },
  phoneticRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dialectBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 4,
    color: colors.surface,
    fontSize: 11,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  phonetic: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 15,
    lineHeight: 20,
  },
  speakerBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  definitionDivider: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
});

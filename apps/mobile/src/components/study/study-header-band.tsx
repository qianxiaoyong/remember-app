import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { VocabularyContent } from '@remember/contracts';
import { HeaderIconButton } from '../ui/header-icon-button';
import { AppIcon } from '../ui/app-icon';
import { AnimatedSpeakerIcon } from '../ui/animated-speaker-icon';
import { StudyDefinitionStrip } from './study-definition-strip';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface StudyHeaderBandProps {
  content: VocabularyContent;
  onHomePress: () => void;
  onMorePress: () => void;
  onPlayAudio: () => void;
  revealed: boolean;
  primaryAudioPlaying?: boolean;
  /** 复习页顶栏居中包名，如「来自《xxx》」 */
  contextLabel?: string;
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
  const centerLabel = isPreview ? props.previewContextLabel : props.contextLabel;

  return (
    <LinearGradient
      colors={[colors.studyHeaderGradientStart, colors.studyHeaderGradientEnd]}
      end={{ x: 0.5, y: 1 }}
      start={{ x: 0.5, y: 0 }}
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xs },
        props.revealed ? styles.rootRevealed : null,
      ]}
    >
      <View style={styles.toolbar}>
        {isPreview ? (
          <HeaderIconButton
            accessibilityLabel="返回"
            onPress={() => {
              props.onBackPress?.();
            }}
          >
            <AppIcon color={colors.surface} name="chevron-back" size="sm" />
          </HeaderIconButton>
        ) : (
          <HeaderIconButton accessibilityLabel="返回" onPress={props.onHomePress}>
            <AppIcon color={colors.surface} name="chevron-back" size="sm" />
          </HeaderIconButton>
        )}

        {centerLabel ? (
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.contextLabel}>
            {centerLabel}
          </Text>
        ) : (
          <View style={styles.toolbarCenter} />
        )}

        {isPreview ? (
          <View style={styles.toolbarSpacer} />
        ) : (
          <HeaderIconButton accessibilityLabel="更多" onPress={props.onMorePress}>
            <AppIcon color={colors.surface} name="ellipsis-vertical" size="sm" />
          </HeaderIconButton>
        )}
      </View>

      <View style={styles.wordBlock}>
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
          <AnimatedSpeakerIcon
            color={colors.surface}
            playing={props.primaryAudioPlaying ?? false}
          />
        </Pressable>
      </View>

      {props.revealed ? (
        <>
          <View style={styles.definitionDivider} />
          <View style={styles.definitionBlock}>
            <StudyDefinitionStrip content={props.content} />
          </View>
        </>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'stretch',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  rootRevealed: {
    paddingBottom: spacing.sm,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: spacing.touchTarget,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
  },
  toolbarCenter: {
    flex: 1,
  },
  toolbarSpacer: {
    width: spacing.touchTarget,
  },
  contextLabel: {
    color: 'rgba(255, 255, 255, 0.92)',
    flex: 1,
    fontSize: 13,
    marginHorizontal: spacing.xs,
    textAlign: 'center',
  },
  wordBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  definitionBlock: {
    paddingHorizontal: spacing.lg,
  },
  headwordPressable: {
    alignItems: 'center',
  },
  headword: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 38,
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
  definitionDivider: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    height: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
    width: '100%',
  },
});

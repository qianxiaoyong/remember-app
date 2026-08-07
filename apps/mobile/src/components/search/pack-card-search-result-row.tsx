import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PackCardDetail } from '../../data/pack/pack-card-details';
import { SurfaceCard } from '../ui/surface-card';
import { HighlightedText } from './highlighted-text';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackCardSearchResultRowProps {
  card: PackCardDetail;
  keyword: string;
  inReviewPool: boolean;
  onReviewPress: () => void;
}

function resolveSearchSubtitle(card: PackCardDetail): string {
  if (card.cardType === 'vocabulary') {
    return card.content.reveal.definitions[0]?.text ?? '';
  }
  return card.content.lesson.titleZh;
}

export function PackCardSearchResultRow(props: PackCardSearchResultRowProps): ReactElement {
  const definition = resolveSearchSubtitle(props.card);

  return (
    <SurfaceCard>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <HighlightedText
            keyword={props.keyword}
            numberOfLines={1}
            style={styles.headword}
            text={props.card.headword}
          />
          <Text numberOfLines={2} style={styles.definition}>
            {definition}
          </Text>
        </View>
        {props.card.cardType === 'vocabulary' ? (
          <Pressable
            accessibilityRole="button"
            onPress={props.onReviewPress}
            style={styles.rejoinButton}
          >
            <Text style={styles.rejoinLabel}>
              {props.inReviewPool ? '已加复习 ›' : '加入复习 ›'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  headword: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  definition: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  rejoinButton: {
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },
  rejoinLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});

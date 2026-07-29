import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CatalogCoverPresentation } from '../../catalog/resolve-catalog-cover';
import { SurfaceCard } from '../ui/surface-card';
import { PackDetailCover } from './pack-detail-cover';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface PackDetailHeroCardProps {
  title: string;
  summary: string;
  contentTags: string[];
  cardCount: number;
  sizeLabel: string;
  formattedUpdatedAt: string;
  cover: CatalogCoverPresentation;
}

export function PackDetailHeroCard(props: PackDetailHeroCardProps): ReactElement {
  return (
    <SurfaceCard>
      <View style={styles.topRow}>
        <PackDetailCover cover={props.cover} />
        <View style={styles.info}>
          <Text style={styles.title}>{props.title}</Text>
          <View style={styles.tagRow}>
            {props.contentTags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
          <Text style={styles.summary}>{props.summary}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <StatItem label="学习内容" value={String(props.cardCount)} />
        <View style={styles.statDivider} />
        <StatItem label="安装大小" value={props.sizeLabel} />
        <View style={styles.statDivider} />
        <StatItem label="最近更新" value={props.formattedUpdatedAt} />
      </View>
    </SurfaceCard>
  );
}

function StatItem(props: { label: string; value: string }): ReactElement {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{props.value}</Text>
      <Text style={styles.statLabel}>{props.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.background,
    borderRadius: 999,
    color: colors.textSecondary,
    fontSize: 11,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  summary: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  statDivider: {
    backgroundColor: colors.border,
    height: 28,
    width: StyleSheet.hairlineWidth,
  },
});

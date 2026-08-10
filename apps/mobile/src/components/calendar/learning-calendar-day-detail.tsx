import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CalendarDayDetail } from '../../use-cases/get-learning-calendar-day-detail';
import { getInspectSubCategoryLabel } from '../../use-cases/build-inspect-queue';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LearningCalendarDayDetailProps {
  detail: CalendarDayDetail;
}

type InspectCategory = 'first_contact' | 'review' | 'story';

const FIRST_CONTACT_ROWS = [
  { subCategory: 'joined_review', countKey: 'joinedReview' as const },
  { subCategory: 'skipped', countKey: 'skipped' as const },
] as const;

const REVIEW_ROWS = [
  { subCategory: 'remembered', countKey: 'remembered' as const },
  { subCategory: 'not_familiar', countKey: 'notFamiliar' as const },
] as const;

export function LearningCalendarDayDetailPanel(
  props: LearningCalendarDayDetailProps,
): ReactElement {
  const router = useRouter();
  const { detail } = props;
  const dateLabel = formatDateLabel(detail.localDate);
  const firstContactTotal = detail.firstContact.counts.total;
  const reviewTotal = detail.review.counts.total;

  const openInspect = (category: InspectCategory, subCategory: string): void => {
    const first = buildInspectRouteItem(detail, category, subCategory);
    if (!first) {
      return;
    }

    const route =
      first.mode === 'review'
        ? `/review?inspect=1&localDate=${detail.localDate}&category=${category}&subCategory=${subCategory}&index=0`
        : `/study?packId=${first.packId}&knowledgeId=${first.knowledgeId}&inspect=1&localDate=${detail.localDate}&category=${category}&subCategory=${subCategory}&index=0`;

    router.push(route);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.dayHeader}>
        <Text style={styles.dateTitle}>{dateLabel}</Text>
        <Text style={styles.daySummary}>
          新接触 {firstContactTotal} · 复习 {reviewTotal}
        </Text>
      </View>

      {firstContactTotal > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionCaption}>新接触</Text>
          {FIRST_CONTACT_ROWS.map((row, index) => (
            <InspectRow
              key={row.subCategory}
              count={detail.firstContact.counts[row.countKey]}
              isLast={index === FIRST_CONTACT_ROWS.length - 1}
              label={getInspectSubCategoryLabel(row.subCategory)}
              onPress={() => {
                openInspect('first_contact', row.subCategory);
              }}
            />
          ))}
        </View>
      ) : null}

      {firstContactTotal > 0 && reviewTotal > 0 ? <View style={styles.sectionGap} /> : null}

      {reviewTotal > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionCaption}>复习</Text>
          {REVIEW_ROWS.map((row, index) => (
            <InspectRow
              key={row.subCategory}
              count={detail.review.counts[row.countKey]}
              isLast={index === REVIEW_ROWS.length - 1}
              label={getInspectSubCategoryLabel(row.subCategory)}
              onPress={() => {
                openInspect('review', row.subCategory);
              }}
            />
          ))}
        </View>
      ) : null}

      {detail.story.counts.completed > 0 ? (
        <>
          {firstContactTotal > 0 || reviewTotal > 0 ? <View style={styles.sectionGap} /> : null}
          <View style={styles.section}>
            <Text style={styles.sectionCaption}>短文</Text>
            <InspectRow
              count={detail.story.counts.completed}
              isLast
              label="已听完"
              onPress={() => {
                openInspect('story', 'completed');
              }}
            />
          </View>
        </>
      ) : null}

      {firstContactTotal === 0 && reviewTotal === 0 && detail.story.counts.completed === 0 ? (
        <Text style={styles.emptyHint}>当日暂无学习记录</Text>
      ) : null}
    </View>
  );
}

function InspectRow(props: {
  label: string;
  count: number;
  onPress: () => void;
  isLast: boolean;
}): ReactElement {
  const enabled = props.count > 0;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!enabled}
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.inspectRow,
        !props.isLast ? styles.inspectRowBorder : null,
        !enabled ? styles.inspectRowDisabled : null,
        pressed && enabled ? styles.inspectRowPressed : null,
      ]}
    >
      <Text style={[styles.inspectLabel, !enabled ? styles.inspectMuted : null]}>{props.label}</Text>
      <View style={styles.inspectRight}>
        <Text style={[styles.inspectCount, !enabled ? styles.inspectMuted : null]}>
          {props.count}
        </Text>
        {enabled ? <Text style={styles.inspectAction}>查看 ›</Text> : null}
      </View>
    </Pressable>
  );
}

function formatDateLabel(localDate: string): string {
  const [year, month, day] = localDate.split('-');
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return `${month}月${day}日 ${weekdayNames[date.getDay()] ?? ''}`;
}

function buildInspectRouteItem(
  detail: CalendarDayDetail,
  category: string,
  subCategory: string,
): { packId: string; knowledgeId: string; mode: 'study' | 'review' } | null {
  if (category === 'first_contact') {
    const list =
      subCategory === 'pending'
        ? detail.firstContact.pending
        : subCategory === 'joined_review'
          ? detail.firstContact.joinedReview
          : detail.firstContact.skipped;
    const item = list[0];
    if (!item?.knowledgeId) {
      return null;
    }
    return { packId: item.packId, knowledgeId: item.knowledgeId, mode: 'study' };
  }

  if (category === 'review') {
    const list =
      subCategory === 'remembered' ? detail.review.remembered : detail.review.notFamiliar;
    const item = list[0];
    if (!item?.knowledgeId) {
      return null;
    }
    return { packId: item.packId, knowledgeId: item.knowledgeId, mode: 'review' };
  }

  const item = detail.story.completed[0];
  if (!item?.knowledgeId) {
    return null;
  }
  return { packId: item.packId, knowledgeId: item.knowledgeId, mode: 'study' };
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    marginTop: spacing.sm,
    overflow: 'hidden',
    paddingBottom: spacing.xs,
    paddingTop: spacing.sm,
  },
  dayHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dateTitle: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  daySummary: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: spacing.md,
  },
  sectionGap: {
    backgroundColor: colors.border,
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.xs,
  },
  sectionCaption: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  inspectRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 32,
    paddingVertical: 2,
  },
  inspectRowBorder: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inspectRowDisabled: {
    opacity: 0.42,
  },
  inspectRowPressed: {
    opacity: 0.72,
  },
  inspectLabel: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  inspectMuted: {
    color: colors.textMuted,
  },
  inspectRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inspectCount: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    minWidth: 18,
    textAlign: 'right',
  },
  inspectAction: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
    minWidth: 44,
    textAlign: 'right',
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});

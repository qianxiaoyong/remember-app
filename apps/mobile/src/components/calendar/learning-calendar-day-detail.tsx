import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { CalendarDayDetail } from '../../use-cases/get-learning-calendar-day-detail';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface LearningCalendarDayDetailProps {
  detail: CalendarDayDetail;
}

export function LearningCalendarDayDetailPanel(
  props: LearningCalendarDayDetailProps,
): ReactElement {
  const router = useRouter();
  const { detail } = props;
  const dateLabel = formatDateLabel(detail.localDate);

  const openInspect = (
    category: 'first_contact' | 'review' | 'story',
    subCategory: string,
  ): void => {
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
    <View style={styles.wrap}>
      <Text style={styles.dateTitle}>{dateLabel}</Text>

      <DetailSection
        counts={`待处理 ${detail.firstContact.counts.pending} · 已加入复习 ${detail.firstContact.counts.joinedReview} · 暂不 ${detail.firstContact.counts.skipped}`}
        inspectEnabled={detail.firstContact.counts.total > 0}
        onInspect={() => {
          const subCategory =
            detail.firstContact.counts.pending > 0
              ? 'pending'
              : detail.firstContact.counts.joinedReview > 0
                ? 'joined_review'
                : 'skipped';
          openInspect('first_contact', subCategory);
        }}
        title={`新接触 ${detail.firstContact.counts.total}`}
      />

      <DetailSection
        counts={`记住了 ${detail.review.counts.remembered} · 还不熟 ${detail.review.counts.notFamiliar}`}
        inspectEnabled={detail.review.counts.total > 0}
        onInspect={() => {
          const subCategory = detail.review.counts.remembered > 0 ? 'remembered' : 'not_familiar';
          openInspect('review', subCategory);
        }}
        title={`复习 ${detail.review.counts.total}`}
      />

      {detail.story.counts.completed > 0 ? (
        <DetailSection
          counts={`已听完 ${detail.story.counts.completed}`}
          inspectEnabled
          onInspect={() => {
            openInspect('story', 'completed');
          }}
          title={`短文 ${detail.story.counts.completed}`}
        />
      ) : null}
    </View>
  );
}

function DetailSection(props: {
  title: string;
  counts: string;
  inspectEnabled: boolean;
  onInspect: () => void;
}): ReactElement {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{props.title}</Text>
        {props.inspectEnabled ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={props.onInspect}>
            <Text style={styles.inspectLink}>检查 ›</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.sectionCounts}>{props.counts}</Text>
    </View>
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
  wrap: {
    gap: spacing.lg,
  },
  dateTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: spacing.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  inspectLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionCounts: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});

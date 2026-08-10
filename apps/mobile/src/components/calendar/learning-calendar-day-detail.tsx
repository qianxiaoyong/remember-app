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
  { subCategory: 'pending', countKey: 'pending' as const },
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
  const storyTotal = detail.story.counts.completed;

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

  const hasAnySection = reviewTotal > 0 || firstContactTotal > 0 || storyTotal > 0;

  const visibleSections: ReactElement[] = [];
  if (reviewTotal > 0) {
    visibleSections.push(
      <SectionCard key="review" title="复习量" total={reviewTotal}>
        {REVIEW_ROWS.map((row) => (
          <InspectRow
            key={row.subCategory}
            count={detail.review.counts[row.countKey]}
            label={getInspectSubCategoryLabel(row.subCategory)}
            onPress={() => {
              openInspect('review', row.subCategory);
            }}
          />
        ))}
      </SectionCard>,
    );
  }
  if (firstContactTotal > 0) {
    visibleSections.push(
      <SectionCard key="first_contact" title="新词量" total={firstContactTotal}>
        {FIRST_CONTACT_ROWS.map((row) => (
          <InspectRow
            key={row.subCategory}
            count={detail.firstContact.counts[row.countKey]}
            label={getInspectSubCategoryLabel(row.subCategory)}
            onPress={() => {
              openInspect('first_contact', row.subCategory);
            }}
          />
        ))}
      </SectionCard>,
    );
  }
  if (storyTotal > 0) {
    visibleSections.push(
      <SectionCard key="story" title="阅读量" total={storyTotal}>
        <InspectRow
          count={storyTotal}
          label={getInspectSubCategoryLabel('completed')}
          onPress={() => {
            openInspect('story', 'completed');
          }}
        />
      </SectionCard>,
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.dayHeader}>
        <Text style={styles.dateTitle}>{dateLabel}</Text>
      </View>

      {hasAnySection ? (
        <View style={styles.sectionList}>
          {visibleSections.map((section, index) => (
            <View
              key={section.key ?? String(index)}
              style={index < visibleSections.length - 1 ? styles.sectionDivider : null}
            >
              {section}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyHint}>当日暂无学习记录</Text>
      )}
    </View>
  );
}

function SectionCard(props: {
  title: string;
  total: number;
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{props.title}</Text>
        <Text style={styles.sectionTotal}>{props.total}</Text>
      </View>
      <View style={styles.sectionBody}>{props.children}</View>
    </View>
  );
}

function InspectRow(props: {
  label: string;
  count: number;
  onPress: () => void;
}): ReactElement | null {
  if (props.count <= 0) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.inspectRow, pressed ? styles.inspectRowPressed : null]}
    >
      <Text style={styles.inspectLabel}>{props.label}</Text>
      <View style={styles.inspectRight}>
        <Text style={styles.inspectCount}>{props.count}</Text>
        <Text style={styles.inspectChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function formatDateLabel(localDate: string): string {
  const [year, month, day] = localDate.split('-');
  const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return `${month ?? ''}月${day ?? ''}日 ${weekdayNames[date.getDay()] ?? ''}`;
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
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  dayHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dateTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionList: {
    paddingHorizontal: spacing.md,
  },
  sectionDivider: {
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionCard: {
    paddingVertical: spacing.sm,
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
  sectionTotal: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'right',
  },
  sectionBody: {
    gap: 2,
  },
  inspectRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 30,
    paddingLeft: spacing.md,
    paddingVertical: 2,
  },
  inspectRowPressed: {
    opacity: 0.72,
  },
  inspectLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
  },
  inspectRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  inspectCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    minWidth: 16,
    textAlign: 'right',
  },
  inspectChevron: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18,
    minWidth: 12,
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

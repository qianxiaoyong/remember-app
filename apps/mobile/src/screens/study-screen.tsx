import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReviewRating } from '@remember/domain';
import { confirmCardReview } from '../use-cases/confirm-card-review';
import {
  getCurrentCardHeadword,
  getReviewIntervalLabels,
} from '../use-cases/get-review-interval-labels';
import { resumeOrStartStudySession } from '../use-cases/resume-or-start-study-session';
import type { ActiveStudySession } from '../use-cases/study-session-types';

const TEST_PACK_ID = 'remember-test-pack';

export function StudyScreen(): ReactElement {
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startSession = useCallback(() => {
    setMessage(null);
    try {
      const nextSession = resumeOrStartStudySession(TEST_PACK_ID);
      setSession(nextSession);
      if (nextSession.totalCount === 0) {
        setMessage('当前没有待学习任务');
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : '无法开始学习';
      setMessage(detail);
    }
  }, []);

  const currentKnowledgeId = session?.currentItem?.knowledgeId ?? null;
  const headword = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    try {
      return getCurrentCardHeadword(TEST_PACK_ID, currentKnowledgeId);
    } catch {
      return currentKnowledgeId;
    }
  }, [currentKnowledgeId]);

  const intervalLabels = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return getReviewIntervalLabels(currentKnowledgeId);
  }, [currentKnowledgeId]);

  const handleReview = (rating: ReviewRating): void => {
    if (!session?.currentItem) {
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const nextSession = confirmCardReview({
        packId: TEST_PACK_ID,
        knowledgeId: session.currentItem.knowledgeId,
        rating,
      });
      setSession(nextSession);
      if (!nextSession.currentItem) {
        setMessage('本次任务已完成');
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : '保存作答失败';
      setMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>学习 · {TEST_PACK_ID}</Text>
      <Text style={styles.subtitle}>阶段 4 · SM-2 与任务继承验收</Text>

      {!session ? (
        <Pressable accessibilityRole="button" onPress={startSession} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>恢复或开始任务</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.progress}>
            进度 {session.completedCount}/{session.totalCount}
          </Text>
          {headword ? <Text style={styles.headword}>{headword}</Text> : null}

          {session.currentItem && intervalLabels ? (
            <View style={styles.ratingGroup}>
              {(['forgot', 'hard', 'good'] as const).map((rating) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  key={rating}
                  onPress={() => {
                    handleReview(rating);
                  }}
                  style={[styles.ratingButton, isSubmitting ? styles.ratingDisabled : null]}
                >
                  <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
                  <Text style={styles.ratingHint}>{intervalLabels[rating]}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={startSession}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonLabel}>重新加载任务</Text>
          </Pressable>
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const RATING_LABELS: Record<ReviewRating, string> = {
  forgot: '忘记',
  hard: '模糊',
  good: '记得',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    color: '#171717',
    fontSize: 24,
    fontWeight: '600',
  },
  subtitle: {
    color: '#737373',
    fontSize: 14,
    marginBottom: 24,
    marginTop: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progress: {
    color: '#525252',
    fontSize: 14,
    marginBottom: 16,
  },
  headword: {
    color: '#171717',
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 32,
  },
  ratingGroup: {
    gap: 12,
  },
  ratingButton: {
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ratingDisabled: {
    opacity: 0.6,
  },
  ratingLabel: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingHint: {
    color: '#737373',
    fontSize: 13,
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#D4D4D4',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginTop: 24,
  },
  secondaryButtonLabel: {
    color: '#404040',
    fontSize: 15,
  },
  message: {
    color: '#404040',
    fontSize: 14,
    marginTop: 20,
  },
});

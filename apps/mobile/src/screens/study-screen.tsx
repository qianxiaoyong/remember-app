import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { ReviewRating } from '@remember/domain';
import { LexiconPopup } from '../components/lexicon-popup';
import { TokenizedSentence } from '../components/tokenized-sentence';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import { confirmCardReview } from '../use-cases/confirm-card-review';
import { getPackCardDetailUseCase } from '../use-cases/get-pack-card-detail';
import {
  getCurrentCardHeadword,
  getReviewIntervalLabels,
} from '../use-cases/get-review-interval-labels';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { resumeOrStartStudySession } from '../use-cases/resume-or-start-study-session';
import type { ActiveStudySession } from '../use-cases/study-session-types';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';

const TEST_PACK_ID = 'remember-test-pack';

export function StudyScreen(): ReactElement {
  const [session, setSession] = useState<ActiveStudySession | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const startSession = useCallback(() => {
    setMessage(null);
    setRevealed(false);
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
  const cardDetail = useMemo(() => {
    if (!currentKnowledgeId) {
      return null;
    }
    return getPackCardDetailUseCase(TEST_PACK_ID, currentKnowledgeId);
  }, [currentKnowledgeId]);

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
      setRevealed(false);
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

  const openLexicon = (token: string): void => {
    const entry = lookupLexiconToken({ packId: TEST_PACK_ID, token });
    setLexiconEntry(entry);
    setLexiconVisible(true);
    setAudioMessage(null);
    if (entry) {
      setLexiconSaved(isLexiconItemSavedUseCase(TEST_PACK_ID, entry.surfaceForm));
    }
  };

  const handleToggleSave = (): void => {
    if (!lexiconEntry) {
      return;
    }
    const saved = toggleSavedLexiconItem({
      packId: TEST_PACK_ID,
      surfaceForm: lexiconEntry.surfaceForm,
    });
    setLexiconSaved(saved);
  };

  const handlePlayAudio = (): void => {
    if (!lexiconEntry) {
      return;
    }
    void playOrCacheLexiconAudio({
      surfaceForm: lexiconEntry.surfaceForm,
      audioUrl: lexiconEntry.audioUrl,
    }).then((result) => {
      if (result.status === 'no-audio') {
        setAudioMessage('暂无远程发音');
        return;
      }
      if (result.status === 'downloaded') {
        setAudioMessage('首次下载完成，已缓存可离线播放');
        return;
      }
      setAudioMessage('使用离线缓存发音');
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link asChild href="/">
        <Pressable accessibilityRole="button">
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
      </Link>
      <Link asChild href="/search">
        <Pressable accessibilityRole="button">
          <Text style={styles.link}>搜索当前知识库</Text>
        </Pressable>
      </Link>

      <Text style={styles.title}>学习 · {TEST_PACK_ID}</Text>
      <Text style={styles.subtitle}>阶段 4 · 点词 / 搜索 / 收藏本验收</Text>

      {!session ? (
        <Pressable accessibilityRole="button" onPress={startSession} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>恢复或开始任务</Text>
        </Pressable>
      ) : (
        <>
          <Text style={styles.progress}>
            进度 {session.completedCount}/{session.totalCount}
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={revealed}
            onPress={() => {
              setRevealed(true);
            }}
            style={styles.cardArea}
          >
            {headword ? <Text style={styles.headword}>{headword}</Text> : null}
            {!revealed ? (
              <Text style={styles.hint}>点击空白区域显示答案</Text>
            ) : (
              <>
                {cardDetail?.content.reveal.definitions.map((definition, index) => (
                  <Text key={`${definition.text}-${String(index)}`} style={styles.definition}>
                    {definition.pos ? `${definition.pos} ` : ''}
                    {definition.text}
                  </Text>
                ))}
                {cardDetail?.content.reveal.examples.map((example, index) => (
                  <View key={`${example.en}-${String(index)}`} style={styles.exampleBlock}>
                    <TokenizedSentence onTokenPress={openLexicon} sentence={example.en} />
                    <Text style={styles.exampleZh}>{example.zh}</Text>
                  </View>
                ))}
              </>
            )}
          </Pressable>

          {revealed && session.currentItem && intervalLabels ? (
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
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <LexiconPopup
        audioMessage={audioMessage}
        entry={lexiconEntry}
        isSaved={lexiconSaved}
        onClose={() => {
          setLexiconVisible(false);
        }}
        onPlayAudio={handlePlayAudio}
        onToggleSave={handleToggleSave}
        visible={lexiconVisible}
      />
    </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  back: {
    color: '#2563EB',
    fontSize: 14,
    marginBottom: 8,
  },
  link: {
    color: '#2563EB',
    fontSize: 14,
    marginBottom: 16,
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
  cardArea: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    minHeight: 180,
    padding: 20,
  },
  headword: {
    color: '#171717',
    fontSize: 36,
    fontWeight: '600',
    marginBottom: 16,
  },
  hint: {
    color: '#737373',
    fontSize: 14,
  },
  definition: {
    color: '#404040',
    fontSize: 16,
    marginBottom: 8,
  },
  exampleBlock: {
    marginTop: 16,
  },
  exampleZh: {
    color: '#737373',
    fontSize: 14,
    marginTop: 6,
  },
  ratingGroup: {
    gap: 12,
    marginTop: 24,
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
  message: {
    color: '#404040',
    fontSize: 14,
    marginTop: 20,
  },
});

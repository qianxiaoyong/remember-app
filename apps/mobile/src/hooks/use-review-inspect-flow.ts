import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import { confirmReviewOutcome } from '../use-cases/confirm-review-outcome';
import { getReviewOutcomeIntervalLabels } from '../use-cases/get-review-outcome-interval-labels';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import { resolveReviewCardContext } from '../use-cases/resolve-review-card-context';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';
import { useVocabularyStudyAudio } from './use-vocabulary-study-audio';

export function useReviewInspectFlow(knowledgeId: string | null) {
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  useEffect(() => {
    setRevealed(false);
    setLexiconVisible(false);
    setLexiconSelectedSurfaceForm(null);
  }, [knowledgeId]);

  const reviewContext = useMemo(() => {
    if (!knowledgeId) {
      return null;
    }
    return resolveReviewCardContext(knowledgeId);
  }, [knowledgeId]);

  const sourcePackId = reviewContext?.sourcePackId ?? null;

  const { primaryAudioPlaying, playingExampleAudioPath, playPrimaryAudio, playExampleAudio } =
    useVocabularyStudyAudio({
      packId: sourcePackId,
      primaryAudioRelativePath:
        reviewContext?.cardDetail?.cardType === 'vocabulary'
          ? reviewContext.cardDetail.content.prompt.primaryAudio
          : null,
      autoPlayActive:
        !revealed && reviewContext?.cardDetail?.cardType === 'vocabulary' && Boolean(sourcePackId),
      cardKey: knowledgeId,
    });

  const outcomeIntervalLabels = useMemo(() => {
    if (!knowledgeId) {
      return null;
    }
    return getReviewOutcomeIntervalLabels(knowledgeId);
  }, [knowledgeId]);

  const handleOutcome = useCallback(
    (outcome: 'passed' | 'failed') => {
      if (!knowledgeId) {
        return;
      }
      setIsSubmitting(true);
      setMessage(null);
      try {
        confirmReviewOutcome({
          knowledgeId,
          outcome,
          inspectMode: true,
          activitySource: 'calendar_inspect',
          ...(reviewContext?.cardDetail?.cardType === 'vocabulary'
            ? { displayLabel: reviewContext.cardDetail.content.prompt.headword }
            : {}),
        });
        setRevealed(false);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存复习结果失败');
      } finally {
        setIsSubmitting(false);
      }
    },
    [knowledgeId, reviewContext?.cardDetail],
  );

  const openLexicon = useCallback(
    (token: string) => {
      if (!sourcePackId) {
        return;
      }
      const surfaceForm = normalizeSurfaceForm(token);
      setLexiconSelectedSurfaceForm(surfaceForm);
      const entry = lookupLexiconToken({ packId: sourcePackId, token });
      setLexiconEntry(entry);
      setLexiconVisible(true);
      setAudioMessage(null);
      setLexiconSaved(entry ? isLexiconItemSavedUseCase(sourcePackId, entry.surfaceForm) : false);
    },
    [sourcePackId],
  );

  return {
    reviewContext,
    revealed,
    isSubmitting,
    message,
    outcomeIntervalLabels,
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm: lexiconVisible ? lexiconSelectedSurfaceForm : null,
    audioMessage,
    setRevealed,
    handlePassed: () => handleOutcome('passed'),
    handleFailed: () => handleOutcome('failed'),
    openLexicon,
    handlePlayPrimaryAudio: () => {
      if (reviewContext?.cardDetail?.cardType === 'vocabulary') {
        playPrimaryAudio(reviewContext.cardDetail.content.prompt.primaryAudio);
      }
    },
    handlePlayExampleAudio: playExampleAudio,
    handlePlayLexiconAudio: () => {
      if (!lexiconEntry) {
        return;
      }
      void playOrCacheLexiconAudio({
        surfaceForm: lexiconEntry.surfaceForm,
        audioUrl: lexiconEntry.audioUrl,
      }).then((result) => {
        if (result.status === 'no-audio') {
          setAudioMessage('暂无远程发音');
        }
      });
    },
    handleToggleSave: () => {
      if (!lexiconEntry || !sourcePackId) {
        return;
      }
      setLexiconSaved(
        toggleSavedLexiconItem({ packId: sourcePackId, surfaceForm: lexiconEntry.surfaceForm }),
      );
    },
    closeLexicon: () => {
      setLexiconVisible(false);
      setLexiconSelectedSurfaceForm(null);
    },
    primaryAudioPlaying,
    playingExampleAudioPath,
  };
}

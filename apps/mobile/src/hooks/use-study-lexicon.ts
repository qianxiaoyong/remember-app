import { useCallback, useState } from 'react';
import { normalizeSurfaceForm } from '@remember/contracts';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';
import { lookupLexiconToken } from '../use-cases/lookup-lexicon-token';
import { playOrCacheLexiconAudio } from '../use-cases/play-or-cache-lexicon-audio';
import {
  isLexiconItemSavedUseCase,
  toggleSavedLexiconItem,
} from '../use-cases/toggle-saved-lexicon-item';

export function useStudyLexicon(packId: string) {
  const [lexiconEntry, setLexiconEntry] = useState<LexiconLookupResult | null>(null);
  const [lexiconVisible, setLexiconVisible] = useState(false);
  const [lexiconSaved, setLexiconSaved] = useState(false);
  const [lexiconSelectedSurfaceForm, setLexiconSelectedSurfaceForm] = useState<string | null>(null);
  const [audioMessage, setAudioMessage] = useState<string | null>(null);

  const openLexicon = useCallback(
    (token: string) => {
      const surfaceForm = normalizeSurfaceForm(token);
      setLexiconSelectedSurfaceForm(surfaceForm);
      const entry = lookupLexiconToken({ packId, token });
      setLexiconEntry(entry);
      setLexiconVisible(true);
      setAudioMessage(null);
      setLexiconSaved(entry ? isLexiconItemSavedUseCase(packId, entry.surfaceForm) : false);
    },
    [packId],
  );

  const handleToggleSave = useCallback(() => {
    if (!lexiconEntry) {
      return;
    }
    const saved = toggleSavedLexiconItem({
      packId,
      surfaceForm: lexiconEntry.surfaceForm,
    });
    setLexiconSaved(saved);
  }, [lexiconEntry, packId]);

  const handlePlayAudio = useCallback(() => {
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
  }, [lexiconEntry]);

  const closeLexicon = useCallback(() => {
    setLexiconVisible(false);
    setLexiconSelectedSurfaceForm(null);
  }, []);

  return {
    lexiconEntry,
    lexiconVisible,
    lexiconSaved,
    lexiconSelectedSurfaceForm: lexiconVisible ? lexiconSelectedSurfaceForm : null,
    audioMessage,
    openLexicon,
    handleToggleSave,
    handlePlayAudio,
    closeLexicon,
  };
}

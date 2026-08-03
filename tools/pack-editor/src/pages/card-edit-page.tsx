import { useEffect, useRef, useState, type ReactElement } from 'react';
import type { PackSourceCard } from '@remember/pack-builder/pack-source';
import { isStorySourceCard } from '../utils/is-story-source-card.js';
import { loadPackSource, saveCard } from '../api/local-api-client.js';
import { STORY_CARD_FORM_ID, StoryCardForm } from '../components/story-card-form.js';
import { VOCABULARY_CARD_FORM_ID, VocabularyCardForm } from '../components/vocabulary-card-form.js';
import { LoadingState } from '../components/loading-state.js';
import { StatusBanner } from '../components/status-banner.js';
import { Toast } from '../components/toast.js';

interface CardEditPageProps {
  packId: string;
  sortOrder: number;
  onBack: () => void;
}

export function CardEditPage({ packId, sortOrder, onBack }: CardEditPageProps): ReactElement {
  const [card, setCard] = useState<PackSourceCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const checkRulesRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadPackSource(packId)
      .then((source) => {
        if (cancelled) {
          return;
        }
        const found = source.cards.find((item) => item.sortOrder === sortOrder) ?? null;
        if (!found) {
          setError(`未找到 sortOrder=${String(sortOrder)} 的卡片`);
          return;
        }
        setCard(found);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packId, sortOrder]);

  if (loading) {
    return <LoadingState rows={4} />;
  }

  if (error || !card) {
    return (
      <>
        <StatusBanner variant="error" title={error ?? '卡片不存在'} />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          style={{ marginTop: 'var(--space-3)' }}
        >
          返回列表
        </button>
      </>
    );
  }

  if (isStorySourceCard(card)) {
    const storyCard = card;
    return (
      <div className="edit-page-with-footer">
        {toast && <Toast message={toast} />}

        <StoryCardForm
          packId={packId}
          defaultValues={storyCard.content}
          checkRulesRef={checkRulesRef}
          onSubmit={async (content) => {
            setSaving(true);
            try {
              const nextCard = { ...storyCard, content };
              await saveCard(packId, nextCard);
              setCard(nextCard);
              setToast('已保存');
              window.setTimeout(() => {
                setToast(null);
              }, 2000);
            } catch (saveError: unknown) {
              const message = saveError instanceof Error ? saveError.message : String(saveError);
              setToast(`保存失败：${message}`);
              window.setTimeout(() => {
                setToast(null);
              }, 4000);
            } finally {
              setSaving(false);
            }
          }}
        />

        <div className="sticky-form-footer">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            返回列表
          </button>
          <div className="sticky-form-footer-meta">
            <strong>#{String(sortOrder)}</strong> · {storyCard.content.lesson.code}{' '}
            {storyCard.content.lesson.titleZh}
          </div>
          <div className="sticky-form-footer-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                checkRulesRef.current?.();
              }}
            >
              检查规则
            </button>
            <button
              type="submit"
              form={STORY_CARD_FORM_ID}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving && <span className="btn-spinner" aria-hidden="true" />}
              {saving ? '保存中…' : '保存'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vocabularyCard = card;

  return (
    <>
      {toast && <Toast message={toast} />}

      <VocabularyCardForm
        defaultValues={vocabularyCard.content}
        onSubmit={async (content) => {
          setSaving(true);
          try {
            const nextCard: PackSourceCard = { ...vocabularyCard, content };
            await saveCard(packId, nextCard);
            setCard(nextCard);
            setToast('已保存');
            window.setTimeout(() => {
              setToast(null);
            }, 2000);
          } catch (saveError: unknown) {
            const message = saveError instanceof Error ? saveError.message : String(saveError);
            setToast(`保存失败：${message}`);
            window.setTimeout(() => {
              setToast(null);
            }, 4000);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="sticky-form-footer">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          返回列表
        </button>
        <div className="sticky-form-footer-meta">
          <strong>#{String(sortOrder)}</strong> · {vocabularyCard.content.prompt.headword}
        </div>
        <button
          type="submit"
          form={VOCABULARY_CARD_FORM_ID}
          className="btn btn-primary"
          disabled={saving}
        >
          {saving && <span className="btn-spinner" aria-hidden="true" />}
          {saving ? '保存中…' : '保存'}
        </button>
      </div>
    </>
  );
}

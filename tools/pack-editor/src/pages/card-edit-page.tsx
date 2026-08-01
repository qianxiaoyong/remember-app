import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { PackSourceCard } from '@remember/pack-builder/pack-source';
import { loadPackSource, saveCard } from '../api/local-api-client.js';
import { VocabularyCardForm } from '../components/vocabulary-card-form.js';

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
    return <p>加载中…</p>;
  }

  if (error || !card) {
    return (
      <section>
        <button type="button" onClick={onBack}>
          返回列表
        </button>
        <p role="alert">{error ?? '卡片不存在'}</p>
      </section>
    );
  }

  return (
    <section>
      <header style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button type="button" onClick={onBack}>
          返回列表
        </button>
        <h1 style={{ margin: 0 }}>
          编辑 #{String(sortOrder)} · {card.content.prompt.headword}
        </h1>
      </header>

      {toast && (
        <p role="status" style={{ color: '#2e7d32' }}>
          {toast}
        </p>
      )}

      <VocabularyCardForm
        defaultValues={card.content}
        onSubmit={async (content) => {
          const nextCard: PackSourceCard = { ...card, content };
          await saveCard(packId, nextCard);
          setCard(nextCard);
          setToast('已保存');
          window.setTimeout(() => {
            setToast(null);
          }, 2000);
        }}
      />
    </section>
  );
}

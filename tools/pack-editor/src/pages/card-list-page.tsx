import { useEffect, useMemo, useState, type CSSProperties, type ReactElement } from 'react';
import {
  buildPack,
  loadPackSource,
  suggestNextPatchVersion,
  validatePack,
  type ValidationIssue,
} from '../api/local-api-client.js';

interface CardListPageProps {
  packId: string;
  onBack: () => void;
  onEditCard: (sortOrder: number) => void;
}

export function CardListPage({ packId, onBack, onEditCard }: CardListPageProps): ReactElement {
  const [packVersion, setPackVersion] = useState('');
  const [cards, setCards] = useState<{ sortOrder: number; headword: string }[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | null>(null);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const [showBuildDialog, setShowBuildDialog] = useState(false);
  const [nextVersion, setNextVersion] = useState('');
  const [busyAction, setBusyAction] = useState<'validate' | 'build' | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void loadPackSource(packId)
      .then((source) => {
        if (cancelled) {
          return;
        }
        setPackVersion(source.meta.packVersion);
        setNextVersion(suggestNextPatchVersion(source.meta.packVersion));
        setCards(
          [...source.cards]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((card) => ({
              sortOrder: card.sortOrder,
              headword: card.content.prompt.headword,
            })),
        );
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
  }, [packId]);

  const filteredCards = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return cards;
    }
    return cards.filter((card) => card.headword.toLowerCase().includes(keyword));
  }, [cards, search]);

  const handleValidate = async (): Promise<void> => {
    setBusyAction('validate');
    setValidationIssues(null);
    setBuildMessage(null);
    try {
      const result = await validatePack(packId);
      setValidationIssues(result.issues);
    } catch (validateError: unknown) {
      setError(validateError instanceof Error ? validateError.message : String(validateError));
    } finally {
      setBusyAction(null);
    }
  };

  const handleBuild = async (): Promise<void> => {
    setBusyAction('build');
    setBuildMessage(null);
    try {
      const result = await buildPack(packId, nextVersion.trim() || undefined);
      if (result.ok && result.outputPath) {
        setPackVersion(nextVersion.trim() || packVersion);
        setBuildMessage(`已生成：${result.outputPath}\n请到 Admin 上传发布。`);
        setShowBuildDialog(false);
      } else {
        setBuildMessage(result.error ?? '打包失败');
      }
    } catch (buildError: unknown) {
      setBuildMessage(buildError instanceof Error ? buildError.message : String(buildError));
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return <p>加载中…</p>;
  }

  if (error) {
    return (
      <section>
        <button type="button" onClick={onBack}>
          返回
        </button>
        <p role="alert">加载失败：{error}</p>
      </section>
    );
  }

  return (
    <section>
      <header style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={onBack}>
          返回
        </button>
        <h1 style={{ margin: 0, flex: 1 }}>
          {packId} <small style={{ fontWeight: 400 }}>v{packVersion}</small>
        </h1>
        <button type="button" onClick={() => void handleValidate()} disabled={busyAction !== null}>
          {busyAction === 'validate' ? '校验中…' : '校验'}
        </button>
        <button
          type="button"
          onClick={() => {
            setNextVersion(suggestNextPatchVersion(packVersion));
            setShowBuildDialog(true);
          }}
          disabled={busyAction !== null}
        >
          打包
        </button>
      </header>

      <div style={{ margin: '1rem 0' }}>
        <label>
          搜索 headword：
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ marginLeft: '0.5rem', minWidth: '16rem' }}
          />
        </label>
        <span style={{ marginLeft: '1rem', color: '#666' }}>
          显示 {filteredCards.length} / {cards.length} 条
        </span>
      </div>

      {validationIssues !== null && (
        <div
          role="status"
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            background: validationIssues.length === 0 ? '#e8f5e9' : '#fff3e0',
          }}
        >
          {validationIssues.length === 0 ? (
            <strong>校验通过</strong>
          ) : (
            <>
              <strong>校验发现 {validationIssues.length} 个问题</strong>
              <ul>
                {validationIssues.map((issue, index) => (
                  <li key={`${issue.path}-${String(index)}`}>
                    {issue.sortOrder !== undefined ? `#${String(issue.sortOrder)} ` : ''}
                    {issue.path}: {issue.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {buildMessage && (
        <pre
          role="status"
          style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '0.75rem' }}
        >
          {buildMessage}
        </pre>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={cellStyle}>sortOrder</th>
            <th style={cellStyle}>headword</th>
          </tr>
        </thead>
        <tbody>
          {filteredCards.map((card) => (
            <tr
              key={card.sortOrder}
              onClick={() => onEditCard(card.sortOrder)}
              style={{ cursor: 'pointer' }}
            >
              <td style={cellStyle}>{card.sortOrder}</td>
              <td style={cellStyle}>{card.headword}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showBuildDialog && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: '1rem', minWidth: '20rem' }}>
            <h2 style={{ marginTop: 0 }}>打包确认</h2>
            <p>将 bump meta.packVersion 并执行 build:pack。</p>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              packVersion
              <input
                type="text"
                value={nextVersion}
                onChange={(event) => setNextVersion(event.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowBuildDialog(false)}>
                取消
              </button>
              <button type="button" onClick={() => void handleBuild()} disabled={busyAction === 'build'}>
                {busyAction === 'build' ? '打包中…' : '确认打包'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const cellStyle: CSSProperties = {
  border: '1px solid #ddd',
  padding: '0.5rem',
  textAlign: 'left',
};

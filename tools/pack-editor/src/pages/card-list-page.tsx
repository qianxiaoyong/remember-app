import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { isStorySourceCard } from '../utils/is-story-source-card.js';
import {
  buildPack,
  createCard,
  deleteCard,
  loadPackSource,
  suggestNextPatchVersion,
  validatePack,
  type ValidationIssue,
} from '../api/local-api-client.js';
import { ConfirmDialog } from '../components/confirm-dialog.js';
import { DataTable } from '../components/data-table.js';
import { LoadingState } from '../components/loading-state.js';
import { PageHeader } from '../components/page-header.js';
import { SearchInput } from '../components/search-input.js';
import { StatusBanner } from '../components/status-banner.js';

interface CardListPageProps {
  packId: string;
  onBack: () => void;
  onEditCard: (sortOrder: number, headword: string) => void;
}

export function CardListPage({ packId, onBack, onEditCard }: CardListPageProps): ReactElement {
  const [packVersion, setPackVersion] = useState('');
  const [cards, setCards] = useState<{ sortOrder: number; headword: string }[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[] | null>(null);
  const [buildMessage, setBuildMessage] = useState<string | null>(null);
  const [buildOutputPath, setBuildOutputPath] = useState<string | null>(null);
  const [showBuildDialog, setShowBuildDialog] = useState(false);
  const [nextVersion, setNextVersion] = useState('');
  const [busyAction, setBusyAction] = useState<'validate' | 'build' | 'create' | 'delete' | null>(
    null,
  );
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    sortOrder: number;
    headword: string;
  } | null>(null);

  const reloadCards = useCallback(async (): Promise<void> => {
    const source = await loadPackSource(packId);
    setPackVersion(source.meta.packVersion);
    setNextVersion(suggestNextPatchVersion(source.meta.packVersion));
    setCards(
      [...source.cards]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((card) => ({
          sortOrder: card.sortOrder,
          headword: isStorySourceCard(card)
            ? `${card.content.lesson.code} ${card.content.lesson.titleEn}`
            : card.content.prompt.headword,
        })),
    );
  }, [packId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void reloadCards()
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
  }, [reloadCards]);

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
    setBuildOutputPath(null);
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
    setBuildOutputPath(null);
    try {
      const result = await buildPack(packId, nextVersion.trim() || undefined);
      if (result.ok && result.outputPath) {
        setPackVersion(nextVersion.trim() || packVersion);
        setBuildOutputPath(result.outputPath);
        setBuildMessage('打包成功，请到 Admin 上传发布。');
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

  const handleCopyPath = async (): Promise<void> => {
    if (!buildOutputPath) {
      return;
    }
    try {
      await navigator.clipboard.writeText(buildOutputPath);
      setCopyHint('已复制路径');
      window.setTimeout(() => {
        setCopyHint(null);
      }, 2000);
    } catch {
      setCopyHint('复制失败，请手动复制');
    }
  };

  const handleCreate = async (): Promise<void> => {
    setBusyAction('create');
    setError(null);
    try {
      const card = await createCard(packId);
      if (isStorySourceCard(card)) {
        throw new Error('createCard returned unexpected story_reading card');
      }
      onEditCard(card.sortOrder, card.content.prompt.headword);
    } catch (createError: unknown) {
      setError(createError instanceof Error ? createError.message : String(createError));
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteTarget) {
      return;
    }
    setBusyAction('delete');
    setError(null);
    try {
      await deleteCard(packId, deleteTarget.sortOrder);
      await reloadCards();
      setDeleteTarget(null);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader title={packId} description="加载卡片列表…" />
        <LoadingState rows={8} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title={packId}
          actions={
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              返回
            </button>
          }
        />
        <StatusBanner variant="error" title="加载失败">
          <p>{error}</p>
        </StatusBanner>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={packId}
        description={`当前版本 v${packVersion} · 共 ${String(cards.length)} 张卡片`}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={onBack}>
              返回
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleValidate()}
              disabled={busyAction !== null}
            >
              {busyAction === 'validate' && <span className="btn-spinner" aria-hidden="true" />}
              {busyAction === 'validate' ? '校验中…' : '校验'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setNextVersion(suggestNextPatchVersion(packVersion));
                setShowBuildDialog(true);
              }}
              disabled={busyAction !== null}
            >
              打包
            </button>
          </>
        }
      />

      {validationIssues !== null && (
        <StatusBanner
          variant={validationIssues.length === 0 ? 'success' : 'warning'}
          title={
            validationIssues.length === 0
              ? '校验通过'
              : `校验发现 ${String(validationIssues.length)} 个问题`
          }
          onDismiss={() => {
            setValidationIssues(null);
          }}
        >
          {validationIssues.length > 0 && (
            <ul className="status-issue-list">
              {validationIssues.map((issue, index) => (
                <li key={`${issue.path}-${String(index)}`}>
                  {issue.sortOrder !== undefined ? `#${String(issue.sortOrder)} ` : ''}
                  {issue.path}: {issue.message}
                </li>
              ))}
            </ul>
          )}
        </StatusBanner>
      )}

      {buildMessage && (
        <StatusBanner
          variant={buildOutputPath ? 'success' : 'error'}
          title={buildMessage}
          onDismiss={() => {
            setBuildMessage(null);
            setBuildOutputPath(null);
          }}
        >
          {buildOutputPath && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>{buildOutputPath}</code>
              <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void handleCopyPath()}
                >
                  复制路径
                </button>
                {copyHint && <span style={{ fontSize: '12px' }}>{copyHint}</span>}
              </div>
            </div>
          )}
        </StatusBanner>
      )}

      <div className="card-panel">
        <div className="toolbar">
          <SearchInput value={search} onChange={setSearch} placeholder="搜索 headword…" />
          <span className="toolbar-meta">
            显示 {filteredCards.length} / {cards.length} 条
          </span>
          <div className="toolbar-spacer" />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => void handleCreate()}
            disabled={busyAction !== null}
          >
            {busyAction === 'create' && <span className="btn-spinner" aria-hidden="true" />}+
            新增单词
          </button>
        </div>

        <DataTable
          showActions
          columns={[
            { key: 'sortOrder', label: '#', className: 'data-table-col-index' },
            { key: 'headword', label: 'headword' },
          ]}
          rows={filteredCards.map((card) => ({
            id: card.sortOrder,
            onClick: () => {
              onEditCard(card.sortOrder, card.headword);
            },
            cells: [card.sortOrder, card.headword],
            action: (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-row-delete"
                title={`删除 ${card.headword}`}
                onClick={() => {
                  setDeleteTarget({ sortOrder: card.sortOrder, headword: card.headword });
                }}
              >
                删除
              </button>
            ),
          }))}
          emptyMessage={search ? '没有匹配的 headword' : '暂无卡片'}
        />
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="删除单词"
        description={
          deleteTarget
            ? `确定删除 #${String(deleteTarget.sortOrder)}「${deleteTarget.headword}」？此操作不可撤销。`
            : ''
        }
        confirmLabel="确认删除"
        busy={busyAction === 'delete'}
        onCancel={() => {
          setDeleteTarget(null);
        }}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <ConfirmDialog
        open={showBuildDialog}
        title="打包确认"
        description={`将把 meta.packVersion 从 v${packVersion} bump 为 v${nextVersion}（默认 patch +1，可修改），然后执行 build:pack。`}
        confirmLabel="确认打包"
        busy={busyAction === 'build'}
        onCancel={() => {
          setShowBuildDialog(false);
        }}
        onConfirm={() => void handleBuild()}
      >
        <label className="field-label">
          packVersion（建议 {suggestNextPatchVersion(packVersion)}）
          <input
            className="input"
            type="text"
            value={nextVersion}
            onChange={(event) => {
              setNextVersion(event.target.value);
            }}
          />
        </label>
      </ConfirmDialog>
    </>
  );
}

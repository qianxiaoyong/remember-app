import { useEffect, useState, type ReactElement } from 'react';
import { listPacks, type PackSummary } from '../api/local-api-client.js';
import { DataTable } from '../components/data-table.js';
import { EmptyState } from '../components/empty-state.js';
import { LoadingState } from '../components/loading-state.js';
import { PageHeader } from '../components/page-header.js';
import { StatusBanner } from '../components/status-banner.js';

interface PackPickerPageProps {
  onSelectPack: (packId: string) => void;
}

export function PackPickerPage({ onSelectPack }: PackPickerPageProps): ReactElement {
  const [items, setItems] = useState<PackSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void listPacks()
      .then((packs) => {
        if (!cancelled) {
          setItems(packs);
        }
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
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="选择学习包" description="内容目录：tools/pack-builder/source/" />
        <LoadingState rows={4} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="选择学习包" />
        <StatusBanner variant="error" title="加载失败">
          <p>{error}</p>
        </StatusBanner>
      </>
    );
  }

  return (
    <>
      <PageHeader title="选择学习包" description="内容目录：tools/pack-builder/source/" />
      <div className="card-panel">
        {items.length === 0 ? (
          <EmptyState
            title="暂无学习包"
            description="请在 tools/pack-builder/source/ 下创建含 meta.json 的目录"
          />
        ) : (
          <DataTable
            columns={[
              { key: 'packId', label: 'packId', className: 'data-table-col-main' },
              { key: 'version', label: '版本' },
              { key: 'count', label: '卡片数', className: 'data-table-col-narrow' },
            ]}
            rows={items.map((item) => ({
              id: item.packId,
              onClick: () => {
                onSelectPack(item.packId);
              },
              cells: [
                <span className="data-table-col-main">{item.packId}</span>,
                <span className="badge">v{item.packVersion}</span>,
                <span className="data-table-col-narrow">{item.cardCount}</span>,
              ],
            }))}
          />
        )}
      </div>
    </>
  );
}

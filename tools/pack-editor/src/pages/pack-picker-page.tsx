import { useEffect, useState, type CSSProperties, type ReactElement } from 'react';
import { listPacks, type PackSummary } from '../api/local-api-client.js';

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
    return <p>加载中…</p>;
  }

  if (error) {
    return <p role="alert">加载失败：{error}</p>;
  }

  return (
    <section>
      <h1>选择学习包</h1>
      <p>内容目录：tools/pack-builder/source/</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr>
            <th style={cellStyle}>packId</th>
            <th style={cellStyle}>版本</th>
            <th style={cellStyle}>卡片数</th>
            <th style={cellStyle}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.packId}>
              <td style={cellStyle}>{item.packId}</td>
              <td style={cellStyle}>{item.packVersion}</td>
              <td style={cellStyle}>{item.cardCount}</td>
              <td style={cellStyle}>
                <button type="button" onClick={() => onSelectPack(item.packId)}>
                  打开
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const cellStyle: CSSProperties = {
  border: '1px solid #ddd',
  padding: '0.5rem',
  textAlign: 'left',
};

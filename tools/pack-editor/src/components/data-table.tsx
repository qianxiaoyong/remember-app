import type { ReactElement, ReactNode } from 'react';

export interface DataTableRow {
  id: string | number;
  cells: ReactNode[];
  onClick?: () => void;
  action?: ReactNode;
}

interface DataTableProps {
  columns: { key: string; label: string; className?: string }[];
  rows: DataTableRow[];
  emptyMessage?: string;
  showActions?: boolean;
  actionsLabel?: string;
}

export function DataTable({
  columns,
  rows,
  emptyMessage,
  showActions = false,
  actionsLabel = '操作',
}: DataTableProps): ReactElement {
  if (rows.length === 0) {
    return <div className="empty-state">{emptyMessage ?? '暂无数据'}</div>;
  }

  return (
    <div className="data-table-wrap">
      <table className="data-table data-table-compact">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} className={column.className} />
          ))}
          {showActions && <col className="data-table-col-actions" />}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.label}
              </th>
            ))}
            {showActions && <th className="data-table-col-actions">{actionsLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              tabIndex={row.onClick ? 0 : undefined}
              onClick={row.onClick}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && row.onClick) {
                  event.preventDefault();
                  row.onClick();
                }
              }}
            >
              {row.cells.map((cell, index) => (
                <td key={`${String(row.id)}-${String(index)}`} className={columns[index]?.className}>
                  {cell}
                </td>
              ))}
              {showActions && (
                <td
                  className="row-action-cell data-table-col-actions"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                  }}
                >
                  {row.action}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

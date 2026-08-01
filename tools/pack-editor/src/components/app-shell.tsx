import type { ReactElement, ReactNode } from 'react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface AppShellProps {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
}

export function AppShell({ breadcrumbs, children }: AppShellProps): ReactElement {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          Pack Editor <span>· 记得</span>
        </div>
        <nav className="app-breadcrumbs" aria-label="面包屑">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.label}-${String(index)}`} style={{ display: 'contents' }}>
                {index > 0 && <span className="app-breadcrumb-sep">›</span>}
                {isLast || !item.onClick ? (
                  <span className={isLast ? 'app-breadcrumb-current' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <button type="button" className="app-breadcrumb-link" onClick={item.onClick}>
                    {item.label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}

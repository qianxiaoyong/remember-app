export const adminResourceGroups: Record<string, string> = {
  packs: '内容',
  'redemption-codes': '内容',
  users: '交易',
  orders: '交易',
  'pack-access': '交易',
  refunds: '交易',
  'audit-logs': '系统',
};

export const adminCustomRoutes: Record<string, { group: string; label: string }> = {
  '/catalog-taxonomy': { group: '内容', label: '分类管理' },
};

const actionLabels = {
  create: '新建',
  show: '详情',
  edit: '编辑',
} as const;

export interface AdminRouteInfo {
  group?: string;
  resource?: string;
  resourceLabel?: string;
  action?: string;
  actionLabel?: string;
  /** 面包屑展示段（不含品牌） */
  breadcrumbSegments: string[];
}

export function resolveResourceLabel(
  resource: string,
  definitions: Record<string, { options?: { label?: string } }>,
): string {
  return definitions[resource]?.options?.label ?? resource;
}

export function parseAdminRoute(
  pathname: string,
  definitions: Record<string, { options?: { label?: string } }>,
): AdminRouteInfo {
  if (pathname === '/' || pathname === '') {
    return { breadcrumbSegments: ['驾驶舱'] };
  }

  const custom = adminCustomRoutes[pathname];
  if (custom) {
    return {
      group: custom.group,
      resourceLabel: custom.label,
      breadcrumbSegments: [custom.group, custom.label],
    };
  }

  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[0];
  if (!resource) {
    return { breadcrumbSegments: [] };
  }

  const group = adminResourceGroups[resource];
  const resourceLabel = resolveResourceLabel(resource, definitions);
  const segments: string[] = [];

  if (group) {
    segments.push(group);
  }
  segments.push(resourceLabel);

  let action: string | undefined;
  let actionLabel: string | undefined;

  if (parts[1] === 'create') {
    action = 'create';
    actionLabel = actionLabels.create;
    segments.push(actionLabels.create);
  } else if (parts[1] && parts[2] === 'show') {
    action = 'show';
    actionLabel = actionLabels.show;
    segments.push(actionLabels.show);
  } else if (parts[1] && parts[1] !== 'create') {
    action = 'edit';
    actionLabel = actionLabels.edit;
    segments.push(actionLabels.edit);
  }

  const info: AdminRouteInfo = {
    resource,
    resourceLabel,
    breadcrumbSegments: segments,
  };
  if (group) {
    info.group = group;
  }
  if (action) {
    info.action = action;
  }
  if (actionLabel) {
    info.actionLabel = actionLabel;
  }
  return info;
}

import type { DataProvider, RaRecord } from 'react-admin';
import { adminCreatePackRequestSchema, adminUpdatePackRequestSchema } from '@remember/contracts';
import { adminFetchJson } from '../api/admin-api-client.js';

function filterValueToQueryString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return undefined;
}

function buildQuery(
  params: {
    pagination?: { page: number; perPage: number };
    filter?: Record<string, unknown>;
    sort?: { field: string; order: 'ASC' | 'DESC' };
  },
  options?: { omitFilterKeys?: string[] },
): string {
  const search = new URLSearchParams();
  if (params.pagination) {
    search.set('page', String(params.pagination.page));
    search.set('pageSize', String(params.pagination.perPage));
  }
  if (params.filter) {
    for (const [key, value] of Object.entries(params.filter)) {
      if (options?.omitFilterKeys?.includes(key)) {
        continue;
      }
      const serialized = filterValueToQueryString(value);
      if (serialized !== undefined) {
        search.set(key, serialized);
      }
    }
  }
  const query = search.toString();
  return query.length > 0 ? `?${query}` : '';
}

function resourcePath(resource: string, suffix = ''): string {
  const map: Record<string, string> = {
    orders: '/admin/orders',
    packs: '/admin/packs',
    'pack-access': '/admin/pack-access',
    'audit-logs': '/admin/audit-logs',
    'redemption-codes': '/admin/redemption-codes',
    refunds: '/admin/refunds',
    users: '/admin/users',
  };
  const base = map[resource];
  if (!base) {
    throw new Error(`未知资源: ${resource}`);
  }
  return `${base}${suffix}`;
}

function applyPackListFilters(
  items: Record<string, unknown>[],
  filter?: Record<string, unknown>,
): Record<string, unknown>[] {
  if (!filter) {
    return items;
  }

  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) {
      return false;
    }
    if (filter.primaryCategory && item.primaryCategory !== filter.primaryCategory) {
      return false;
    }
    if (typeof filter.q === 'string' || typeof filter.q === 'number') {
      const query = String(filter.q).trim().toLowerCase();
      if (query.length > 0) {
        const title =
          typeof item.title === 'string' || typeof item.title === 'number'
            ? String(item.title).toLowerCase()
            : '';
        const packId =
          typeof item.packId === 'string' || typeof item.packId === 'number'
            ? String(item.packId).toLowerCase()
            : '';
        if (!title.includes(query) && !packId.includes(query)) {
          return false;
        }
      }
    }
    return true;
  });
}

export const dataProvider = {
  getList: async (resource, params) => {
    const querySuffix =
      resource === 'packs'
        ? buildQuery(params, { omitFilterKeys: ['q', 'status', 'primaryCategory'] })
        : buildQuery(params);

    const json = await adminFetchJson<{
      items: Record<string, unknown>[];
      total?: number;
    }>(`${resourcePath(resource)}${querySuffix}`);

    const mapped = json.items.map((item) => {
      if (resource === 'orders') {
        return { ...item, id: item.orderId };
      }
      if (resource === 'packs') {
        return { ...item, id: item.packId };
      }
      if (resource === 'pack-access') {
        return { ...item, id: item.id ?? `${String(item.userId)}-${String(item.packId)}` };
      }
      if (resource === 'users') {
        return { ...item, id: item.userId };
      }
      return { ...item, id: item.id };
    });

    const packFilter =
      resource === 'packs' && params.filter
        ? (params.filter as Record<string, unknown>)
        : undefined;
    const data =
      resource === 'packs'
        ? (applyPackListFilters(mapped, packFilter) as RaRecord[])
        : (mapped as RaRecord[]);

    return {
      data,
      total: resource === 'packs' ? data.length : (json.total ?? data.length),
    };
  },

  getOne: async (resource, params) => {
    if (resource === 'packs') {
      const json = await adminFetchJson<{ pack: Record<string, unknown> }>(
        `${resourcePath('packs')}/${String(params.id)}`,
      );
      return { data: { ...json.pack, id: json.pack.packId } as RaRecord };
    }
    const json = await adminFetchJson<Record<string, unknown>>(
      `${resourcePath(resource)}/${String(params.id)}`,
    );
    const id =
      resource === 'orders'
        ? json.orderId
        : resource === 'pack-access'
          ? json.id
          : resource === 'users'
            ? json.userId
            : json.id;
    return { data: { ...json, id } as RaRecord };
  },

  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),

  create: async (resource, params) => {
    if (resource === 'pack-access') {
      const json = await adminFetchJson<Record<string, unknown>>('/admin/pack-access/grant', {
        method: 'POST',
        body: JSON.stringify(params.data),
      });
      return { data: { ...json, id: json.id } as RaRecord };
    }
    if (resource === 'refunds') {
      const json = await adminFetchJson<Record<string, unknown>>('/admin/refunds', {
        method: 'POST',
        body: JSON.stringify(params.data),
      });
      return { data: { ...json, id: json.refundId } as RaRecord };
    }
    if (resource === 'redemption-codes') {
      const json = await adminFetchJson<{ items: Record<string, unknown>[] }>(
        '/admin/redemption-codes/batch',
        {
          method: 'POST',
          body: JSON.stringify(params.data),
        },
      );
      const first = json.items[0];
      if (!first) {
        throw new Error('未生成兑换码');
      }
      return { data: { ...first, id: first.id } as RaRecord };
    }
    if (resource === 'packs') {
      const body = adminCreatePackRequestSchema.parse(params.data);
      await adminFetchJson('/admin/packs', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const packId = body.packId;
      return { data: { ...body, id: packId } as RaRecord };
    }
    throw new Error(`不支持创建: ${resource}`);
  },

  update: async (resource, params) => {
    if (resource !== 'packs') {
      throw new Error(`不支持更新: ${resource}`);
    }
    const data = { ...params.data } as Record<string, unknown>;
    if (Array.isArray(data.coverLines)) {
      const line0 = String(data.coverLines[0] ?? '').trim();
      const line1 = String(data.coverLines[1] ?? '').trim();
      if (line0 || line1) {
        data.coverLines = [line0, line1];
      } else {
        delete data.coverLines;
      }
    }
    const patchData = adminUpdatePackRequestSchema.parse(data);
    await adminFetchJson(`/admin/packs/${String(params.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData),
    });
    return { data: { ...params.data, ...patchData, id: String(params.id) } as RaRecord };
  },

  updateMany: () => Promise.resolve({ data: [] }),
  delete: (_resource, params) => Promise.resolve({ data: params.previousData as RaRecord }),
  deleteMany: () => Promise.resolve({ data: [] }),
} as DataProvider;

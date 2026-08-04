import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Title, useNavigate } from 'react-admin';
import { useSearchParams } from 'react-router-dom';
import type { AdminLexiconSummary } from '@remember/contracts';
import { searchLexicon } from '../../api/lexicon-api.js';
import { AdminApiError } from '../../api/admin-api-client.js';
import { AdminPageHeader } from '../../components/admin-page-header.js';
import { AdminPanel, adminPanelTableSx } from '../../components/admin-panel.js';
import { LemmaStatusChip } from '../../components/lemma-status-chip.js';
import {
  LEXICON_LIST_PAGE_SIZE_OPTIONS,
  type LexiconListSearchState,
  type LexiconSortField,
  readLexiconListSearch,
  writeLexiconListSearch,
} from './lexicon-list-search.js';

const SOURCE_LABELS: Record<string, string> = {
  ecdict: 'ECDICT',
  manual: '人工',
  ai: 'AI',
  merged: '合并',
};

const SORTABLE_COLUMNS: { field: LexiconSortField; label: string }[] = [
  { field: 'headword', label: '词形' },
  { field: 'lemmaKey', label: 'lemma key' },
  { field: 'status', label: '状态' },
  { field: 'ipa', label: '音标' },
  { field: 'pos', label: '词性' },
  { field: 'source', label: '来源' },
];

function formatSource(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

function formatRange(offset: number, count: number, total: number): string {
  if (total === 0) {
    return '共 0 条';
  }
  const start = offset + 1;
  const end = offset + count;
  return `共 ${String(total)} 条 · 第 ${String(start)}–${String(end)} 条`;
}

export function LexiconListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const listState = useMemo(() => readLexiconListSearch(searchParams), [searchParams]);
  const [queryInput, setQueryInput] = useState(listState.q);
  const [items, setItems] = useState<AdminLexiconSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const replaceListState = useCallback(
    (next: LexiconListSearchState) => {
      setSearchParams(writeLexiconListSearch(next), { replace: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    setQueryInput(listState.q);
  }, [listState.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = queryInput.trim();
      if (trimmed === listState.q.trim()) {
        return;
      }
      replaceListState({ ...listState, q: trimmed, page: 0 });
    }, 300);
    return () => {
      window.clearTimeout(timer);
    };
  }, [queryInput, listState, replaceListState]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await searchLexicon({
        ...(listState.q ? { q: listState.q } : {}),
        limit: listState.pageSize,
        offset: listState.page * listState.pageSize,
        ...(listState.status !== 'all' ? { status: listState.status } : {}),
        ...(listState.sortBy ? { sortBy: listState.sortBy, sortOrder: listState.sortOrder } : {}),
      });
      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      setItems([]);
      setTotal(0);
      setErrorMessage(
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '加载失败',
      );
    } finally {
      setLoading(false);
    }
  }, [listState]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const pageCount = Math.max(1, Math.ceil(total / listState.pageSize));

  useEffect(() => {
    if (listState.page > 0 && listState.page >= pageCount) {
      replaceListState({ ...listState, page: Math.max(0, pageCount - 1) });
    }
  }, [listState, pageCount, replaceListState]);

  function handleSort(field: LexiconSortField): void {
    const nextOrder = listState.sortBy === field && listState.sortOrder === 'asc' ? 'desc' : 'asc';
    replaceListState({
      ...listState,
      page: 0,
      sortBy: field,
      sortOrder: nextOrder,
    });
  }

  const listSearchString = searchParams.toString();
  const detailSearchSuffix = listSearchString.length > 0 ? `?${listSearchString}` : '';

  const pageShellSx = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 48px - 32px)',
    overflow: 'hidden',
  } as const;

  return (
    <Box sx={pageShellSx}>
      <Title title="中心词库" />
      <Box sx={{ flexShrink: 0 }}>
        <AdminPageHeader title="中心词库" embedded />
      </Box>

      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflow: 'hidden', pt: 1.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
          <TextField
            size="small"
            placeholder="搜索 headword 或 lemma key…"
            value={queryInput}
            onChange={(event) => {
              setQueryInput(event.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, maxWidth: 480 }}
          />
          <TextField
            select
            size="small"
            label="状态"
            value={listState.status}
            onChange={(event) => {
              replaceListState({
                ...listState,
                page: 0,
                status: event.target.value as LexiconListSearchState['status'],
              });
            }}
            sx={{ width: 160 }}
          >
            <MenuItem value="all">全部（含草稿）</MenuItem>
            <MenuItem value="published">已发布</MenuItem>
            <MenuItem value="draft">草稿</MenuItem>
            <MenuItem value="archived">已归档</MenuItem>
          </TextField>
        </Stack>

        {errorMessage ? (
          <Alert severity="error" sx={{ flexShrink: 0 }}>
            {errorMessage}
          </Alert>
        ) : null}

        <AdminPanel
          title="词条列表"
          padded={false}
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          {loading && items.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress size={28} />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography color="text.secondary">暂无词条。</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  ...adminPanelTableSx,
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width={72}>ID</TableCell>
                      {SORTABLE_COLUMNS.map((column) => (
                        <TableCell
                          key={column.field}
                          sortDirection={
                            listState.sortBy === column.field ? listState.sortOrder : false
                          }
                        >
                          <TableSortLabel
                            active={listState.sortBy === column.field}
                            direction={
                              listState.sortBy === column.field ? listState.sortOrder : 'asc'
                            }
                            onClick={() => {
                              handleSort(column.field);
                            }}
                          >
                            {column.label}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow
                        key={item.lemmaKey}
                        hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => {
                          navigate(
                            `/lexicon/${encodeURIComponent(item.lemmaKey)}${detailSearchSuffix}`,
                          );
                        }}
                      >
                        <TableCell>{listState.page * listState.pageSize + index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.headword}</TableCell>
                        <TableCell>{item.lemmaKey}</TableCell>
                        <TableCell>
                          <LemmaStatusChip status={item.status} />
                        </TableCell>
                        <TableCell>{item.ipa ?? '—'}</TableCell>
                        <TableCell>{item.pos ?? '—'}</TableCell>
                        <TableCell>{formatSource(item.source)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {formatRange(listState.page * listState.pageSize, items.length, total)}
                </Typography>

                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <TextField
                    select
                    size="small"
                    label="每页"
                    value={String(listState.pageSize)}
                    onChange={(event) => {
                      replaceListState({
                        ...listState,
                        page: 0,
                        pageSize: Number.parseInt(event.target.value, 10),
                      });
                    }}
                    sx={{ width: 108 }}
                  >
                    {LEXICON_LIST_PAGE_SIZE_OPTIONS.map((size) => (
                      <MenuItem key={size} value={String(size)}>
                        {String(size)} 条
                      </MenuItem>
                    ))}
                  </TextField>

                  <Pagination
                    count={pageCount}
                    page={listState.page + 1}
                    onChange={(_event, nextPage) => {
                      replaceListState({ ...listState, page: nextPage - 1 });
                    }}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                    disabled={loading}
                  />
                </Stack>
              </Box>
            </Box>
          )}
        </AdminPanel>
      </Stack>
    </Box>
  );
}

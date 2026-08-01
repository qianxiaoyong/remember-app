import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Link as MuiLink,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Link, useRecordContext } from 'react-admin';
import { fetchRedemptionCodes, type RedemptionCodeListItem } from '../api/redemption-api.js';
import { MonoText } from '../components/mono-text.js';
import { RedemptionStatusChip } from '../components/admin-status-chips.js';
import { PackRedemptionBatchForm } from './redemption-batch-create.js';
import { RedemptionCodeRowActions } from './redemption-code-row-actions.js';

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('zh-CN');
}

export function PackRedemptionCodesPanel() {
  const record = useRecordContext<{ packId?: string }>();
  const packId = record?.packId;
  const [items, setItems] = useState<RedemptionCodeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCodes = useCallback(async () => {
    if (!packId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetchRedemptionCodes({
        packId,
        page: 1,
        pageSize: 50,
        includeDeleted: true,
      });
      setItems(response.items);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '加载兑换码失败');
    } finally {
      setLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  if (!packId) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          本知识库兑换码
        </Typography>
        <MuiLink
          component={Link}
          to={`/redemption-codes?filter=${encodeURIComponent(JSON.stringify({ packId }))}`}
        >
          在兑换码管理页查看 →
        </MuiLink>
      </Stack>

      <PackRedemptionBatchForm packId={packId} onCreated={() => void loadCodes()} />

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">暂无兑换码，可上方批量生成。</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>兑换码</TableCell>
              <TableCell>状态</TableCell>
              <TableCell align="right">已兑/上限</TableCell>
              <TableCell>过期时间</TableCell>
              <TableCell>备注</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <MonoText variant="caption">{item.code ?? item.codePreview ?? '—'}</MonoText>
                </TableCell>
                <TableCell>
                  <RedemptionStatusChip isExhausted={item.isExhausted} status={item.status} />
                </TableCell>
                <TableCell align="right">
                  {item.redeemedCount}/{item.maxRedemptions}
                </TableCell>
                <TableCell>{item.expiresAt ? formatDateTime(item.expiresAt) : '—'}</TableCell>
                <TableCell>{item.note ?? '—'}</TableCell>
                <TableCell>
                  <RedemptionCodeRowActions record={item} onChanged={() => void loadCodes()} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

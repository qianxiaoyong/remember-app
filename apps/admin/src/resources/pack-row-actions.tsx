import { useState, type MouseEvent } from 'react';
import { Button, Stack } from '@mui/material';
import { useNotify, useRecordContext, useRefresh } from 'react-admin';
import { deletePack } from '../api/packs-api.js';
import { AdminApiError } from '../api/admin-api-client.js';

interface PackRowRecord {
  packId?: string;
  title?: string;
}

export function PackRowActions() {
  const record = useRecordContext<PackRowRecord>();
  const notify = useNotify();
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);

  if (!record?.packId) {
    return null;
  }

  const handleDelete = async (event: MouseEvent) => {
    event.stopPropagation();
    const label = record.title ?? record.packId;
    const confirmed = window.confirm(
      `确定删除知识库「${label}」？\n` +
        '将移除目录条目、版本与未兑换的兑换码；已有订单、用户权益或兑换记录的知识库无法删除。',
    );
    if (!confirmed) {
      return;
    }

    setBusy(true);
    try {
      await deletePack(record.packId);
      notify('已删除知识库', { type: 'success' });
      refresh();
    } catch (error) {
      const message =
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '删除失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} onClick={(event) => event.stopPropagation()}>
      <Button
        color="error"
        disabled={busy}
        onClick={(event) => void handleDelete(event)}
        size="small"
      >
        删除
      </Button>
    </Stack>
  );
}

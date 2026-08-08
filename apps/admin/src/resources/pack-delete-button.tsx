import { useState } from 'react';
import { Button } from '@mui/material';
import { useNotify, useRecordContext, useRedirect, useRefresh } from 'react-admin';
import { deletePack } from '../api/packs-api.js';
import { AdminApiError } from '../api/admin-api-client.js';

interface PackDeleteRecord {
  packId?: string;
  title?: string;
}

export function PackDeleteButton() {
  const record = useRecordContext<PackDeleteRecord>();
  const notify = useNotify();
  const refresh = useRefresh();
  const redirect = useRedirect();
  const [busy, setBusy] = useState(false);

  if (!record?.packId) {
    return null;
  }

  const handleDelete = async () => {
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
      redirect('/packs');
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
    <Button color="error" disabled={busy} onClick={() => void handleDelete()} variant="outlined">
      删除
    </Button>
  );
}

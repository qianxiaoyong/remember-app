import { useState } from 'react';
import type { AdminUpdateRedemptionCodeRequest } from '@remember/contracts';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useNotify } from 'react-admin';
import { updateRedemptionCode, type RedemptionCodeListItem } from '../api/redemption-api.js';
import { AdminApiError } from '../api/admin-api-client.js';

interface RedemptionCodeEditDialogProps {
  open: boolean;
  record: RedemptionCodeListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function RedemptionCodeEditDialog(props: RedemptionCodeEditDialogProps) {
  const notify = useNotify();
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [status, setStatus] = useState<'active' | 'disabled'>('active');
  const [note, setNote] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [busy, setBusy] = useState(false);

  const handleEnter = () => {
    if (!props.record) {
      return;
    }
    setMaxRedemptions(String(props.record.maxRedemptions));
    setStatus(props.record.status === 'disabled' ? 'disabled' : 'active');
    setNote(props.record.note ?? '');
    setExpiresAt(
      props.record.expiresAt ? new Date(props.record.expiresAt).toISOString().slice(0, 16) : '',
    );
  };

  const handleSave = async () => {
    if (!props.record) {
      return;
    }
    const parsedMax = Number(maxRedemptions);
    if (!Number.isInteger(parsedMax) || parsedMax < props.record.redeemedCount) {
      notify(`上限须为不小于已兑换次数（${String(props.record.redeemedCount)}）的整数`, {
        type: 'warning',
      });
      return;
    }

    const payload: AdminUpdateRedemptionCodeRequest = {
      maxRedemptions: parsedMax,
      status,
      note: note.trim() ? note.trim() : null,
      expiresAt: expiresAt.trim() ? new Date(expiresAt).toISOString() : null,
    };

    setBusy(true);
    try {
      await updateRedemptionCode(props.record.id, payload);
      notify('兑换码已更新', { type: 'success' });
      props.onSaved();
      props.onClose();
    } catch (error) {
      const message =
        error instanceof AdminApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '更新失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={props.onClose}
      open={props.open}
      slotProps={{ transition: { onEnter: handleEnter } }}
    >
      <DialogTitle>编辑兑换码</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="兑换码"
            value={props.record?.code ?? props.record?.codePreview ?? '—'}
            slotProps={{ input: { readOnly: true } }}
            fullWidth
          />
          <TextField
            label="兑换上限"
            type="number"
            value={maxRedemptions}
            onChange={(event) => {
              setMaxRedemptions(event.target.value);
            }}
            helperText={
              props.record
                ? `已兑换 ${String(props.record.redeemedCount)} 次，上限不能更小`
                : undefined
            }
            fullWidth
          />
          <TextField
            select
            label="状态"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as 'active' | 'disabled');
            }}
            fullWidth
          >
            <MenuItem value="active">可用</MenuItem>
            <MenuItem value="disabled">已停用</MenuItem>
          </TextField>
          <TextField
            label="过期时间"
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => {
              setExpiresAt(event.target.value);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="留空表示永不过期"
            fullWidth
          />
          <TextField
            label="备注"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
            }}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>取消</Button>
        <Button disabled={busy} onClick={() => void handleSave()} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { useNotify, useRefresh } from 'react-admin';
import {
  deleteRedemptionCode,
  restoreRedemptionCode,
  updateRedemptionCode,
  type RedemptionCodeListItem,
} from '../api/redemption-api.js';
import { AdminApiError } from '../api/admin-api-client.js';
import { RedemptionCodeEditDialog } from './redemption-code-edit-dialog.js';
import { MonoText } from '../components/mono-text.js';

interface RedemptionCodeRowActionsProps {
  record: RedemptionCodeListItem;
  onChanged?: () => void;
}

export function RedemptionCodeRowActions(props: RedemptionCodeRowActionsProps) {
  const notify = useNotify();
  const refresh = useRefresh();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const codeLabel = props.record.code ?? props.record.codePreview ?? props.record.id;

  const handleChanged = () => {
    refresh();
    props.onChanged?.();
  };

  const handleDisableToggle = async () => {
    if (!props.record.canEdit) {
      return;
    }
    setBusy(true);
    try {
      await updateRedemptionCode(props.record.id, {
        status: props.record.status === 'disabled' ? 'active' : 'disabled',
      });
      notify(props.record.status === 'disabled' ? '已启用' : '已停用', { type: 'success' });
      handleChanged();
    } catch (error) {
      const message =
        error instanceof AdminApiError ? error.message : error instanceof Error ? error.message : '操作失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `确定删除兑换码「${codeLabel}」？\n已发出的码将失效；已兑换用户的权益不受影响。`,
    );
    if (!confirmed) {
      return;
    }
    setBusy(true);
    try {
      await deleteRedemptionCode(props.record.id);
      notify('已删除', { type: 'success' });
      handleChanged();
    } catch (error) {
      const message =
        error instanceof AdminApiError ? error.message : error instanceof Error ? error.message : '删除失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setBusy(true);
    try {
      await restoreRedemptionCode(props.record.id);
      notify('已恢复', { type: 'success' });
      handleChanged();
    } catch (error) {
      const message =
        error instanceof AdminApiError ? error.message : error instanceof Error ? error.message : '恢复失败';
      notify(message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {props.record.canEdit ? (
          <>
            <Button disabled={busy} onClick={() => setEditOpen(true)} size="small">
              编辑
            </Button>
            <Button disabled={busy} onClick={() => void handleDisableToggle()} size="small">
              {props.record.status === 'disabled' ? '启用' : '停用'}
            </Button>
            <Button color="error" disabled={busy} onClick={() => void handleDelete()} size="small">
              删除
            </Button>
          </>
        ) : null}
        {props.record.canRestore ? (
          <Button disabled={busy} onClick={() => void handleRestore()} size="small">
            恢复
          </Button>
        ) : null}
      </Stack>
      <RedemptionCodeEditDialog
        onClose={() => setEditOpen(false)}
        onSaved={handleChanged}
        open={editOpen}
        record={props.record}
      />
    </>
  );
}

interface RedemptionBatchResultDialogProps {
  open: boolean;
  codes: string[];
  onClose: () => void;
}

export function RedemptionBatchResultDialog(props: RedemptionBatchResultDialogProps) {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={props.onClose} open={props.open}>
      <DialogTitle>兑换码已生成</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }} variant="body2">
          请复制保存以下明文码（列表中可随时查看）：
        </Typography>
        <Stack spacing={1}>
          {props.codes.map((code) => (
            <MonoText key={code}>{code}</MonoText>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} variant="contained">
          知道了
        </Button>
      </DialogActions>
    </Dialog>
  );
}

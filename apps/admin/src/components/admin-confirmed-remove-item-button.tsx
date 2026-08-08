import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { useSimpleFormIteratorItem } from 'react-admin';
import { AdminMiniConfirmDialog } from './admin-mini-confirm-dialog.js';

interface AdminConfirmedRemoveItemButtonProps {
  title?: string;
  description?: string;
}

export function AdminConfirmedRemoveItemButton(
  props: AdminConfirmedRemoveItemButtonProps,
): ReactElement {
  const { remove } = useSimpleFormIteratorItem();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="删除">
        <IconButton
          aria-label="删除"
          color="warning"
          onClick={() => {
            setOpen(true);
          }}
          size="small"
        >
          <RemoveCircleOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <AdminMiniConfirmDialog
        confirmLabel="删除"
        description={props.description ?? '删除后需保存表单才会生效。'}
        open={open}
        title={props.title ?? '删除此条目？'}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={() => {
          remove();
          setOpen(false);
        }}
      />
    </>
  );
}

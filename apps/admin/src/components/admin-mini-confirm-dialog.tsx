import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';

interface AdminMiniConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirming?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminMiniConfirmDialog(props: AdminMiniConfirmDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} lineHeight={1.4}>
          {props.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.5 }}>
          {props.description}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 0.5 }}>
        <Button size="small" disabled={Boolean(props.confirming)} onClick={props.onClose}>
          取消
        </Button>
        <Button
          color="error"
          disabled={Boolean(props.confirming)}
          onClick={props.onConfirm}
          size="small"
          variant="contained"
        >
          {props.confirmLabel ?? '删除'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

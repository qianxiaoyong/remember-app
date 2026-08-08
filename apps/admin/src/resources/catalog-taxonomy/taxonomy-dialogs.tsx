import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { AdminMiniConfirmDialog } from '../../components/admin-mini-confirm-dialog.js';

interface TaxonomyLabelDialogProps {
  open: boolean;
  title: string;
  label: string;
  onClose: () => void;
  onConfirm: (label: string) => void;
}

export function TaxonomyLabelDialog(props: TaxonomyLabelDialogProps) {
  const [value, setValue] = useState(props.label);

  useEffect(() => {
    if (props.open) {
      setValue(props.label);
    }
  }, [props.open, props.label]);

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="xs">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="展示名"
          margin="dense"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>取消</Button>
        <Button
          variant="contained"
          disabled={value.trim().length === 0}
          onClick={() => {
            props.onConfirm(value.trim());
          }}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface TaxonomyCreateDialogProps {
  open: boolean;
  title: string;
  slugLabel?: string;
  slugPlaceholder?: string;
  labelPlaceholder?: string;
  onClose: () => void;
  onConfirm: (input: { slug: string; label: string }) => void;
}

export function TaxonomyCreateDialog(props: TaxonomyCreateDialogProps) {
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (props.open) {
      setSlug('');
      setLabel('');
    }
  }, [props.open]);

  const canSubmit = slug.trim().length > 0 && label.trim().length > 0;

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label={props.slugLabel ?? 'slug'}
          {...(props.slugPlaceholder ? { placeholder: props.slugPlaceholder } : {})}
          value={slug}
          onChange={(event) => {
            setSlug(event.target.value);
          }}
          helperText="内部标识，创建后慎改"
        />
        <TextField
          label="展示名"
          {...(props.labelPlaceholder ? { placeholder: props.labelPlaceholder } : {})}
          value={label}
          onChange={(event) => {
            setLabel(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>取消</Button>
        <Button
          variant="contained"
          disabled={!canSubmit}
          onClick={() => {
            props.onConfirm({ slug: slug.trim(), label: label.trim() });
          }}
        >
          创建
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface TaxonomyDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function TaxonomyDeleteDialog(props: TaxonomyDeleteDialogProps) {
  return (
    <AdminMiniConfirmDialog
      description={props.description}
      onClose={props.onClose}
      onConfirm={props.onConfirm}
      open={props.open}
      title={props.title}
    />
  );
}

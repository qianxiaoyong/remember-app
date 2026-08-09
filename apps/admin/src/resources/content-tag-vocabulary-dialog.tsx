import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import type { AdminContentTagVocabularyItem } from '@remember/contracts';
import { AdminMiniConfirmDialog } from '../components/admin-mini-confirm-dialog.js';
import {
  deleteAdminContentTagVocabulary,
  fetchAdminContentTagVocabulary,
} from '../api/content-tags-api.js';

interface ContentTagVocabularyDialogProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export function ContentTagVocabularyDialog(props: ContentTagVocabularyDialogProps): ReactElement {
  const [items, setItems] = useState<AdminContentTagVocabularyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAdminContentTagVocabulary();
      setItems(response.items);
    } catch {
      setError('加载标签词库失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!props.open) {
      return;
    }
    void loadItems();
  }, [loadItems, props.open]);

  async function confirmRemoval(): Promise<void> {
    if (!pendingRemoval) {
      return;
    }
    setDeleting(true);
    try {
      await deleteAdminContentTagVocabulary(pendingRemoval);
      setPendingRemoval(null);
      await loadItems();
      props.onChanged();
    } catch {
      setError('删除标签失败');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 2,
            },
          },
        }}
      >
        <DialogContent sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            标签词库
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.5 }}>
            删除词库项后，下拉不再提示；已挂在知识库上的标签仍会展示。
          </Typography>
          {error ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          ) : null}
          <List dense disablePadding sx={{ mt: 1, maxHeight: 280, overflow: 'auto' }}>
            {loading ? (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary="加载中…" />
              </ListItem>
            ) : items.length === 0 ? (
              <ListItem sx={{ px: 0 }}>
                <ListItemText primary="暂无词库标签" secondary="保存知识库时会自动入库" />
              </ListItem>
            ) : (
              items.map((item) => (
                <ListItem
                  key={item.label}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label={`删除 ${item.label}`}
                      onClick={() => {
                        setPendingRemoval(item.label);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ px: 0 }}
                >
                  <ListItemText primary={item.label} />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5, pt: 0 }}>
          <Button size="small" onClick={props.onClose}>
            关闭
          </Button>
        </DialogActions>
      </Dialog>
      <AdminMiniConfirmDialog
        open={pendingRemoval !== null}
        title="删除词库标签？"
        description={
          pendingRemoval
            ? `确定从词库移除「${pendingRemoval}」？已使用该标签的知识库仍会展示，但下拉将不再提示。`
            : ''
        }
        confirmLabel="删除"
        confirming={deleting}
        onClose={() => {
          if (!deleting) {
            setPendingRemoval(null);
          }
        }}
        onConfirm={() => {
          void confirmRemoval();
        }}
      />
    </>
  );
}

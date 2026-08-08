import { Autocomplete, TextField } from '@mui/material';
import { useState, type ReactElement, type SyntheticEvent } from 'react';
import { useInput } from 'react-admin';
import { AdminMiniConfirmDialog } from '../components/admin-mini-confirm-dialog.js';

const CONTENT_TAG_SUGGESTIONS = ['词汇', '上册', '下册', '全册'];

function normalizeTags(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of values) {
    const tag = raw.trim();
    if (!tag || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    result.push(tag);
  }
  return result;
}

interface PendingRemoval {
  tag: string;
  nextTags: string[];
}

export function ContentTagsInput(): ReactElement {
  const { field } = useInput({ source: 'contentTags' });
  const tags = normalizeTags(Array.isArray(field.value) ? field.value.map(String) : []);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);

  function handleChange(_event: SyntheticEvent, newValue: string[]) {
    const nextTags = normalizeTags(newValue);
    if (nextTags.length < tags.length) {
      const removed = tags.find((tag) => !nextTags.includes(tag));
      if (removed) {
        setPendingRemoval({ tag: removed, nextTags });
        return;
      }
    }
    field.onChange(nextTags);
  }

  return (
    <>
      <Autocomplete
        multiple
        freeSolo
        options={CONTENT_TAG_SUGGESTIONS}
        value={tags}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            id={params.id}
            disabled={params.disabled}
            fullWidth={params.fullWidth}
            size="small"
            placeholder="输入或选择标签"
            slotProps={{
              input: params.InputProps,
              htmlInput: params.inputProps,
            }}
          />
        )}
        size="small"
        sx={{ width: '100%' }}
      />
      <AdminMiniConfirmDialog
        open={pendingRemoval !== null}
        title="移除标签？"
        description={
          pendingRemoval ? `确定移除「${pendingRemoval.tag}」？保存后 App 将不再展示该标签。` : ''
        }
        confirmLabel="移除"
        onClose={() => {
          setPendingRemoval(null);
        }}
        onConfirm={() => {
          if (pendingRemoval) {
            field.onChange(pendingRemoval.nextTags);
          }
          setPendingRemoval(null);
        }}
      />
    </>
  );
}

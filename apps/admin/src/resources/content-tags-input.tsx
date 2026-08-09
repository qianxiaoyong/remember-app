import { Autocomplete, Box, Button, TextField } from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type SyntheticEvent,
} from 'react';
import { useInput } from 'react-admin';
import { AdminMiniConfirmDialog } from '../components/admin-mini-confirm-dialog.js';
import {
  fetchAdminContentTagVocabulary,
  upsertAdminContentTagVocabulary,
} from '../api/content-tags-api.js';
import { ContentTagVocabularyDialog } from './content-tag-vocabulary-dialog.js';

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
  const [options, setOptions] = useState<string[]>([]);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [vocabularyOpen, setVocabularyOpen] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const response = await fetchAdminContentTagVocabulary();
      setOptions(response.items.map((item) => item.label));
    } catch {
      setOptions([]);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const dropdownOptions = useMemo(() => normalizeTags([...options, ...tags]), [options, tags]);

  const persistNewTags = useCallback(
    (added: string[]) => {
      if (added.length === 0) {
        return;
      }
      setOptions((current) => normalizeTags([...current, ...added]));
      void upsertAdminContentTagVocabulary(added).catch(() => {
        void loadOptions();
      });
    },
    [loadOptions],
  );

  function handleChange(_event: SyntheticEvent, newValue: string[]) {
    const nextTags = normalizeTags(newValue);
    if (nextTags.length < tags.length) {
      const removed = tags.find((tag) => !nextTags.includes(tag));
      if (removed) {
        setPendingRemoval({ tag: removed, nextTags });
        return;
      }
    }

    const added = nextTags.filter((tag) => !tags.includes(tag));
    field.onChange(nextTags);
    persistNewTags(added);
  }

  return (
    <>
      <Autocomplete
        multiple
        freeSolo
        filterSelectedOptions={false}
        options={dropdownOptions}
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
        <Button
          size="small"
          variant="text"
          sx={{ minWidth: 0, px: 0.5, fontSize: 12 }}
          onClick={() => {
            setVocabularyOpen(true);
          }}
        >
          管理词库
        </Button>
      </Box>
      <ContentTagVocabularyDialog
        open={vocabularyOpen}
        onClose={() => {
          setVocabularyOpen(false);
        }}
        onChanged={() => {
          void loadOptions();
        }}
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

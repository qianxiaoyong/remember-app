import { Button } from '@mui/material';
import { useId, useRef, useState, type ChangeEvent, type ReactElement } from 'react';
import { useNotify } from 'react-admin';
import { uploadAdminMedia } from '../api/media-api.js';

interface AdminImageUploadButtonProps {
  onUploaded: (url: string) => void;
  label?: string;
  disabled?: boolean;
}

export function AdminImageUploadButton(props: AdminImageUploadButtonProps): ReactElement {
  const notify = useNotify();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }
    setLoading(true);
    try {
      const url = await uploadAdminMedia(file);
      props.onUploaded(url);
      notify('图片已上传', { type: 'success' });
    } catch (error) {
      notify(error instanceof Error ? error.message : '上传失败', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          void handleFileChange(event);
        }}
      />
      <Button
        size="small"
        variant="outlined"
        disabled={Boolean(props.disabled) || loading}
        onClick={() => {
          inputRef.current?.click();
        }}
        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {loading ? '上传中…' : (props.label ?? '上传图片')}
      </Button>
    </>
  );
}

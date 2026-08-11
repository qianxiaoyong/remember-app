import {
  Button,
  NumberInput,
  useNotify,
  useRecordContext,
  useInput,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, TextField as MuiTextField, Typography } from '@mui/material';
import { useId, useRef, useState, type ChangeEvent, type ReactElement } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { uploadAdminCover } from '../api/media-api.js';
import { resolveAdminMediaPreviewSrc } from '../api/resolve-admin-media-preview-src.js';
import { AdminImageUploadButton } from '../components/admin-image-upload-field.js';
import { AdminLabeledField } from '../components/admin-form-section.js';
import { formatMoney } from '../components/format-money.js';
import { adminColors } from '../theme/admin-colors.js';

export const hiddenLabel = false as unknown as string;

function normalizeCoverLines(value: unknown): [string, string] {
  const raw = Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];
  return [raw[0] ?? '', raw[1] ?? ''];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${String(bytes)} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CoverUploadSizeInfo {
  originalSizeBytes: number;
  thumbnailSizeBytes: number;
}

function CoverUploadButton(props: {
  onUploaded: (result: {
    coverUrl: string;
    coverThumbnailUrl: string;
    originalSizeBytes: number;
    thumbnailSizeBytes: number;
  }) => void;
}): ReactElement {
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
      const result = await uploadAdminCover(file);
      props.onUploaded(result);
      notify('封面与列表缩略图已上传', { type: 'success' });
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
        disabled={loading}
        onClick={() => {
          inputRef.current?.click();
        }}
        sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      >
        {loading ? '上传中…' : '上传图片'}
      </Button>
    </>
  );
}

export function CoverUrlField() {
  const { field } = useInput({ source: 'coverUrl' });
  const { field: thumbnailField } = useInput({ source: 'coverThumbnailUrl' });
  const [sizeInfo, setSizeInfo] = useState<CoverUploadSizeInfo | null>(null);
  const value = typeof field.value === 'string' ? field.value : '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
        <MuiTextField
          size="small"
          fullWidth
          value={value}
          placeholder="https://..."
          onChange={(event) => {
            field.onChange(event.target.value);
            thumbnailField.onChange('');
            setSizeInfo(null);
          }}
        />
        <CoverUploadButton
          onUploaded={(result) => {
            field.onChange(result.coverUrl);
            thumbnailField.onChange(result.coverThumbnailUrl);
            setSizeInfo({
              originalSizeBytes: result.originalSizeBytes,
              thumbnailSizeBytes: result.thumbnailSizeBytes,
            });
          }}
        />
      </Box>
      {sizeInfo ? (
        <Typography variant="caption" color="text.secondary">
          原图 {formatBytes(sizeInfo.originalSizeBytes)} · 列表缩略图{' '}
          {formatBytes(sizeInfo.thumbnailSizeBytes)}
        </Typography>
      ) : null}
    </Box>
  );
}

export function CoverThumbnailPreview() {
  const coverThumbnailUrl = useWatch<{ coverThumbnailUrl?: string }>({ name: 'coverThumbnailUrl' });
  const url = typeof coverThumbnailUrl === 'string' ? coverThumbnailUrl.trim() : '';

  if (!url) {
    return null;
  }

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: adminColors.surfaceSunken,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        gap: 0.25,
        height: 56,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 42,
      }}
    >
      <Box
        alt=""
        component="img"
        src={resolveAdminMediaPreviewSrc(url)}
        sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: 9, lineHeight: 1, px: 0.25, textAlign: 'center' }}
      >
        列表
      </Typography>
    </Box>
  );
}

export function IntroMediaUrlField() {
  const { field: urlField } = useInput({ source: 'url' });
  const { field: typeField } = useInput({ source: 'type' });
  const urlValue = typeof urlField.value === 'string' ? urlField.value : '';
  const isImage = typeField.value === 'image';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        flex: 1,
        minWidth: 120,
        alignItems: 'center',
      }}
    >
      <MuiTextField
        size="small"
        fullWidth
        value={urlValue}
        placeholder="https://..."
        onChange={(event) => {
          urlField.onChange(event.target.value);
        }}
        sx={{ flex: 1 }}
      />
      {isImage ? (
        <AdminImageUploadButton
          label="上传"
          onUploaded={(url) => {
            urlField.onChange(url);
          }}
        />
      ) : null}
    </Box>
  );
}

export function CoverPreview() {
  const coverUrl = useWatch<{ coverUrl?: string }>({ name: 'coverUrl' });
  const url = typeof coverUrl === 'string' ? coverUrl.trim() : '';

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: adminColors.surfaceSunken,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1,
        display: 'flex',
        flexShrink: 0,
        height: 56,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 42,
      }}
    >
      {url ? (
        <Box
          alt=""
          component="img"
          src={resolveAdminMediaPreviewSrc(url)}
          sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
    </Box>
  );
}

export function CoverLinesInline() {
  const { field } = useInput({ source: 'coverLines' });
  const [line0, line1] = normalizeCoverLines(field.value);

  const setLine = (index: 0 | 1, value: string) => {
    const next: [string, string] = index === 0 ? [value, line1] : [line0, value];
    field.onChange(next);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: 0 }}>
      <AdminLabeledField label="文案 1">
        <MuiTextField
          size="small"
          fullWidth
          value={line0}
          onChange={(e) => {
            setLine(0, e.target.value);
          }}
        />
      </AdminLabeledField>
      <AdminLabeledField label="文案 2">
        <MuiTextField
          size="small"
          fullWidth
          value={line1}
          onChange={(e) => {
            setLine(1, e.target.value);
          }}
        />
      </AdminLabeledField>
    </Box>
  );
}

export function PricePreview() {
  const priceCents = useWatch<{ priceCents?: number }>({ name: 'priceCents' });
  const cents = typeof priceCents === 'number' ? priceCents : Number(priceCents) || 0;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
      约合 {formatMoney(cents)}
    </Typography>
  );
}

export function ExtractSamplePreviewsButton() {
  const { setValue } = useFormContext();
  const record = useRecordContext<{ packId?: string; currentPackVersion?: string }>();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      label="从发布版本抽取"
      size="small"
      disabled={loading || !record?.currentPackVersion}
      onClick={() => {
        void (async () => {
          if (!record?.packId) {
            return;
          }
          setLoading(true);
          try {
            const result = await extractSamplePreviews(record.packId);
            setValue('samplePreviews', result.samplePreviews, { shouldDirty: true });
            notify('已从当前发布版本抽取示例', { type: 'success' });
          } catch (error) {
            notify(error instanceof Error ? error.message : '抽取失败', { type: 'error' });
          } finally {
            setLoading(false);
          }
        })();
      }}
    />
  );
}

export function PackPriceCentsInput() {
  return (
    <>
      <NumberInput source="priceCents" label={hiddenLabel} fullWidth size="small" />
      <PricePreview />
    </>
  );
}

import { Button, NumberInput, useNotify, useRecordContext, useInput } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { Box, TextField as MuiTextField, Typography } from '@mui/material';
import { useState } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { AdminImageUploadButton } from '../components/admin-image-upload-field.js';
import { AdminLabeledField } from '../components/admin-form-section.js';
import { formatMoney } from '../components/format-money.js';
import { adminColors } from '../theme/admin-colors.js';

export const hiddenLabel = false as unknown as string;

function normalizeCoverLines(value: unknown): [string, string] {
  const raw = Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];
  return [raw[0] ?? '', raw[1] ?? ''];
}

export function CoverUrlField() {
  const { field } = useInput({ source: 'coverUrl' });
  const value = typeof field.value === 'string' ? field.value : '';

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>
      <MuiTextField
        size="small"
        fullWidth
        value={value}
        placeholder="https://..."
        onChange={(event) => {
          field.onChange(event.target.value);
        }}
      />
      <AdminImageUploadButton
        onUploaded={(url) => {
          field.onChange(url);
        }}
      />
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
          src={url}
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

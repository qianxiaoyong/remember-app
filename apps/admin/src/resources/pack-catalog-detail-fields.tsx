import {
  ArrayInput,
  AutocompleteArrayInput,
  Button,
  NumberInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useNotify,
  useRecordContext,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { useInput } from 'react-admin';
import Grid from '@mui/material/Grid2';
import { Box, TextField as MuiTextField, Typography } from '@mui/material';
import { useState } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { AdminPanel, adminPanelTableSx } from '../components/admin-panel.js';
import { formatMoney } from '../components/format-money.js';
import { compactIteratorSx, packFormDensitySx } from '../components/pack-form-section.js';
import { adminColors } from '../theme/admin-colors.js';
import { PackTaxonomyFields } from './pack-taxonomy-fields.js';

const CONTENT_TAG_CHOICES = [
  { id: '词汇', name: '词汇' },
  { id: '上册', name: '上册' },
  { id: '下册', name: '下册' },
  { id: '全册', name: '全册' },
];

const packStatusChoices = [
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已上架' },
];

const INTRO_MEDIA_TYPE_CHOICES = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
];

function normalizeCoverLines(value: unknown): [string, string] {
  const raw = Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];
  return [raw[0] ?? '', raw[1] ?? ''];
}

function CoverPreview() {
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
        height: 64,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 48,
      }}
    >
      {url ? (
        <Box
          alt=""
          component="img"
          src={url}
          sx={{ height: '100%', objectFit: 'cover', width: '100%' }}
          onError={(event) => {
            (event.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
    </Box>
  );
}

function CoverLinesTwoInputs() {
  const { field } = useInput({ source: 'coverLines' });
  const [line0, line1] = normalizeCoverLines(field.value);

  const setLine = (index: 0 | 1, value: string) => {
    const next: [string, string] = index === 0 ? [value, line1] : [line0, value];
    field.onChange(next);
  };

  return (
    <Grid container spacing={1} sx={{ width: '100%', mt: 0.5 }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          label="文案行 1"
          size="small"
          fullWidth
          value={line0}
          onChange={(event) => setLine(0, event.target.value)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <MuiTextField
          label="文案行 2"
          size="small"
          fullWidth
          value={line1}
          onChange={(event) => setLine(1, event.target.value)}
        />
      </Grid>
    </Grid>
  );
}

function PricePreview() {
  const priceCents = useWatch<{ priceCents?: number }>({ name: 'priceCents' });
  const cents = typeof priceCents === 'number' ? priceCents : Number(priceCents) || 0;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
      = {formatMoney(cents)}
    </Typography>
  );
}

function ExtractSamplePreviewsButton() {
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

/** 目录与详情：基础 + 营销字段单页双栏布局。 */
export function PackCatalogDetailFields() {
  return (
    <Box sx={packFormDensitySx}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <AdminPanel title="目录与定价">
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextInput source="title" label="标题" validate={required()} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextInput source="displayTitle" label="展示标题" fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <PackTaxonomyFields compact />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <AutocompleteArrayInput
                  source="contentTags"
                  label="内容标签"
                  choices={CONTENT_TAG_CHOICES}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <NumberInput source="priceCents" label="售价（分）" fullWidth size="small" />
                  </Box>
                  <PricePreview />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <SelectInput
                  source="status"
                  label="上架状态"
                  choices={packStatusChoices}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextInput
                  source="summary"
                  label="简介"
                  multiline
                  fullWidth
                  minRows={2}
                  maxRows={3}
                  size="small"
                />
              </Grid>
            </Grid>
          </AdminPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <StackedRightPanels />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AdminPanel title="内容介绍" padded={false}>
            <Box sx={adminPanelTableSx}>
              <ArrayInput source="introMedia" label="">
                <SimpleFormIterator inline disableReordering sx={compactIteratorSx}>
                  <SelectInput
                    source="type"
                    label="类型"
                    choices={INTRO_MEDIA_TYPE_CHOICES}
                    helperText={false}
                    size="small"
                    sx={{ width: 88 }}
                  />
                  <NumberInput source="sortOrder" label="序" helperText={false} size="small" sx={{ width: 64 }} />
                  <TextInput source="url" label="URL" helperText={false} size="small" sx={{ flex: 1, minWidth: 120 }} />
                </SimpleFormIterator>
              </ArrayInput>
            </Box>
          </AdminPanel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <AdminPanel
            title="内容示例"
            padded={false}
            actions={<ExtractSamplePreviewsButton />}
          >
            <Box sx={adminPanelTableSx}>
              <ArrayInput source="samplePreviews" label="">
                <SimpleFormIterator disableReordering sx={compactIteratorSx}>
                  <Grid container spacing={1} sx={{ width: '100%' }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextInput source="headword" label="单词" fullWidth helperText={false} size="small" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 2 }}>
                      <TextInput source="initial" label="首字母" fullWidth helperText={false} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <TextInput source="zh" label="释义" fullWidth helperText={false} size="small" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextInput source="exampleEn" label="例句" fullWidth helperText={false} size="small" />
                    </Grid>
                  </Grid>
                </SimpleFormIterator>
              </ArrayInput>
            </Box>
          </AdminPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

function StackedRightPanels() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      <AdminPanel title="封面与角标">
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <CoverPreview />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextInput source="coverUrl" label="封面 URL" fullWidth size="small" />
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput source="coverBadge" label="角标" fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <CoverLinesTwoInputs />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </AdminPanel>

      <AdminPanel title="包含内容" padded={false}>
        <Box sx={adminPanelTableSx}>
          <ArrayInput source="includedHighlights" label="">
            <SimpleFormIterator inline disableReordering sx={compactIteratorSx}>
              <TextInput
                source="title"
                label="标题"
                helperText={false}
                size="small"
                sx={{ width: '38%', minWidth: 100 }}
              />
              <TextInput
                source="description"
                label="说明"
                helperText={false}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </Box>
      </AdminPanel>
    </Box>
  );
}
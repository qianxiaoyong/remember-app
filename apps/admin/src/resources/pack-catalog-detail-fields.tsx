import {
  Button,
  NumberInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  required,
  useNotify,
  useRecordContext,
  useInput,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import { Box, TextField as MuiTextField, Typography } from '@mui/material';
import { useState } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { CompactArrayBlock } from '../components/admin-compact-array.js';
import { AdminConfirmedRemoveItemButton } from '../components/admin-confirmed-remove-item-button.js';
import { AdminImageUploadButton } from '../components/admin-image-upload-field.js';
import {
  AdminFormSection,
  AdminLabeledField,
  packCatalogFormSurfaceSx,
  packCatalogMainColumnSx,
  packCatalogSidebarSx,
} from '../components/admin-form-section.js';
import { formatMoney } from '../components/format-money.js';
import { compactIteratorSx, packFormDensitySx } from '../components/pack-form-section.js';
import { adminColors } from '../theme/admin-colors.js';
import { adminPanelTableSx } from '../components/admin-panel.js';
import { PackTaxonomyFields } from './pack-taxonomy-fields.js';
import { ContentTagsInput } from './content-tags-input.js';

const packStatusChoices = [
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已上架' },
];

const INTRO_MEDIA_TYPE_CHOICES = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
];

const hiddenLabel = false as unknown as string;

function normalizeCoverLines(value: unknown): [string, string] {
  const raw = Array.isArray(value) ? value.map((item) => String(item ?? '')) : [];
  return [raw[0] ?? '', raw[1] ?? ''];
}

function CoverUrlField() {
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

function IntroMediaUrlField() {
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

function CoverLinesInline() {
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

function PricePreview() {
  const priceCents = useWatch<{ priceCents?: number }>({ name: 'priceCents' });
  const cents = typeof priceCents === 'number' ? priceCents : Number(priceCents) || 0;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
      约合 {formatMoney(cents)}
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

function BasicInfoSection() {
  return (
    <AdminFormSection title="基本信息">
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdminLabeledField label="标题" requiredMark>
            <TextInput
              source="title"
              label={hiddenLabel}
              validate={required()}
              fullWidth
              size="small"
            />
          </AdminLabeledField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <AdminLabeledField label="展示标题">
            <TextInput source="displayTitle" label={hiddenLabel} fullWidth size="small" />
          </AdminLabeledField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <PackTaxonomyFields compact />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <AdminLabeledField label="简介">
            <TextInput
              source="summary"
              label={hiddenLabel}
              multiline
              fullWidth
              minRows={2}
              maxRows={3}
              size="small"
            />
          </AdminLabeledField>
        </Grid>
      </Grid>
    </AdminFormSection>
  );
}

function CoverStripSection() {
  return (
    <AdminFormSection title="封面">
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <CoverPreview />
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <AdminLabeledField label="封面 URL">
            <CoverUrlField />
          </AdminLabeledField>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 88 }, flexShrink: 0 }}>
          <AdminLabeledField label="角标">
            <TextInput source="coverBadge" label={hiddenLabel} fullWidth size="small" />
          </AdminLabeledField>
        </Box>
        <CoverLinesInline />
      </Box>
    </AdminFormSection>
  );
}

function AppDisplaySection() {
  return (
    <AdminFormSection title="App 详情页展示" divider={false}>
      <CompactArrayBlock
        source="includedHighlights"
        title="包含内容"
        defaultItem={{ title: '', description: '' }}
      >
        <SimpleFormIterator
          inline
          disableReordering
          sx={compactIteratorSx}
          removeButton={
            <AdminConfirmedRemoveItemButton
              title="删除包含内容？"
              description="确定删除这条「包含内容」？保存后 App 详情页将不再展示。"
            />
          }
        >
          <TextInput
            source="title"
            label="标题"
            helperText={false}
            size="small"
            sx={{ width: '36%', minWidth: 96 }}
          />
          <TextInput
            source="description"
            label="说明"
            helperText={false}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
        </SimpleFormIterator>
      </CompactArrayBlock>

      <CompactArrayBlock
        source="introMedia"
        title="内容介绍"
        defaultItem={(count) => ({ type: 'image', sortOrder: count, url: '' })}
      >
        <Box sx={adminPanelTableSx}>
          <SimpleFormIterator
            inline
            disableReordering
            sx={compactIteratorSx}
            removeButton={
              <AdminConfirmedRemoveItemButton
                title="删除介绍条目？"
                description="确定删除这条「内容介绍」？保存后 App 详情页将不再展示。"
              />
            }
          >
            <SelectInput
              source="type"
              label="类型"
              choices={INTRO_MEDIA_TYPE_CHOICES}
              defaultValue="image"
              helperText={false}
              size="small"
              sx={{ width: 80 }}
            />
            <IntroMediaUrlField />
          </SimpleFormIterator>
        </Box>
      </CompactArrayBlock>

      <CompactArrayBlock
        source="samplePreviews"
        title="内容示例"
        defaultItem={{ headword: '', initial: '', zh: '', exampleEn: '' }}
        headerAction={<ExtractSamplePreviewsButton />}
      >
        <Box sx={adminPanelTableSx}>
          <SimpleFormIterator
            disableReordering
            sx={compactIteratorSx}
            removeButton={
              <AdminConfirmedRemoveItemButton
                title="删除内容示例？"
                description="确定删除这条「内容示例」？保存后 App 详情页将不再展示。"
              />
            }
          >
            <Grid container spacing={1} sx={{ width: '100%' }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextInput
                  source="headword"
                  label="单词"
                  fullWidth
                  helperText={false}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextInput
                  source="initial"
                  label="首字母"
                  fullWidth
                  helperText={false}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextInput source="zh" label="释义" fullWidth helperText={false} size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextInput
                  source="exampleEn"
                  label="例句"
                  fullWidth
                  helperText={false}
                  size="small"
                />
              </Grid>
            </Grid>
          </SimpleFormIterator>
        </Box>
      </CompactArrayBlock>
    </AdminFormSection>
  );
}

function PublishSidebar() {
  return (
    <AdminFormSection title="发布" divider={false}>
      <AdminLabeledField label="上架状态">
        <SelectInput
          source="status"
          label={hiddenLabel}
          choices={packStatusChoices}
          fullWidth
          size="small"
        />
      </AdminLabeledField>
      <AdminLabeledField label="售价（分）">
        <NumberInput source="priceCents" label={hiddenLabel} fullWidth size="small" />
        <PricePreview />
      </AdminLabeledField>
      <AdminLabeledField label="内容标签">
        <ContentTagsInput />
      </AdminLabeledField>
    </AdminFormSection>
  );
}

/** 目录与详情：Shopify 式单表单 + sticky 发布侧栏。 */
export function PackCatalogDetailFields(props: { embedded?: boolean }) {
  const embedded = props.embedded ?? false;

  return (
    <Box
      sx={{
        ...packFormDensitySx,
        width: '100%',
        ...(embedded ? {} : packCatalogFormSurfaceSx),
      }}
    >
      <Grid container>
        <Grid size={{ xs: 12, lg: 8 }} sx={packCatalogMainColumnSx}>
          <BasicInfoSection />
          <CoverStripSection />
          <AppDisplaySection />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }} sx={packCatalogSidebarSx}>
          <PublishSidebar />
        </Grid>
      </Grid>
    </Box>
  );
}

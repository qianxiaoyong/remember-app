import { SelectInput, SimpleFormIterator, TextInput, required } from 'react-admin';
import Grid from '@mui/material/Grid2';
import { Box } from '@mui/material';
import { CompactArrayBlock } from '../components/admin-compact-array.js';
import { AdminConfirmedRemoveItemButton } from '../components/admin-confirmed-remove-item-button.js';
import {
  AdminFormSection,
  AdminLabeledField,
  packCatalogFormSurfaceSx,
  packCatalogMainColumnSx,
  packCatalogSidebarSx,
} from '../components/admin-form-section.js';
import { compactIteratorSx, packFormDensitySx } from '../components/pack-form-section.js';
import { adminPanelTableSx } from '../components/admin-panel.js';
import { PackTaxonomyFields } from './pack-taxonomy-fields.js';
import { ContentTagsInput } from './content-tags-input.js';
import {
  CoverLinesInline,
  CoverPreview,
  CoverUrlField,
  ExtractSamplePreviewsButton,
  hiddenLabel,
  IntroMediaUrlField,
  PackPriceCentsInput,
} from './pack-catalog-form-widgets.js';

const packStatusChoices = [
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已上架' },
];

const INTRO_MEDIA_TYPE_CHOICES = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
];

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
        <PackPriceCentsInput />
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

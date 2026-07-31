import {
  ArrayInput,
  Button,
  NumberInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  useNotify,
  useRecordContext,
} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import { Box } from '@mui/material';
import { useState } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { PackFormSection, packFormDensitySx } from '../components/pack-form-section.js';
import { adminColors } from '../theme/admin-colors.js';

const INTRO_MEDIA_TYPE_CHOICES = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
];

function CoverPreview() {
  const coverUrl = useWatch<{ coverUrl?: string }>({ name: 'coverUrl' });
  const url = typeof coverUrl === 'string' ? coverUrl.trim() : '';

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: adminColors.statTileBackground,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1,
        display: 'flex',
        flexShrink: 0,
        height: 72,
        justifyContent: 'center',
        overflow: 'hidden',
        width: 54,
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

export function PackMetadataFields() {
  return (
    <Box sx={packFormDensitySx}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PackFormSection title="封面">
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <CoverPreview />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <TextInput source="coverUrl" label="封面 URL" fullWidth size="small" />
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextInput source="coverBadge" label="角标" fullWidth size="small" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <ArrayInput source="coverLines" label="文案行">
                      <SimpleFormIterator inline disableReordering>
                        <TextInput source="" label="文案" helperText={false} size="small" />
                      </SimpleFormIterator>
                    </ArrayInput>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </PackFormSection>

          <PackFormSection title="包含内容">
            <ArrayInput source="includedHighlights" label="">
              <SimpleFormIterator inline disableReordering>
                <TextInput source="title" label="标题" helperText={false} size="small" />
                <TextInput source="description" label="说明" helperText={false} size="small" />
              </SimpleFormIterator>
            </ArrayInput>
          </PackFormSection>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <PackFormSection title="内容介绍">
            <ArrayInput source="introMedia" label="">
              <SimpleFormIterator inline disableReordering>
                <SelectInput
                  source="type"
                  label="类型"
                  choices={INTRO_MEDIA_TYPE_CHOICES}
                  helperText={false}
                  size="small"
                />
                <NumberInput source="sortOrder" label="序" helperText={false} size="small" />
                <TextInput source="url" label="URL" helperText={false} size="small" />
              </SimpleFormIterator>
            </ArrayInput>
          </PackFormSection>

          <PackFormSection title="内容示例">
            <Box sx={{ mb: 0.5 }}>
              <ExtractSamplePreviewsButton />
            </Box>
            <ArrayInput source="samplePreviews" label="">
              <SimpleFormIterator disableReordering>
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
          </PackFormSection>
        </Grid>
      </Grid>
    </Box>
  );
}

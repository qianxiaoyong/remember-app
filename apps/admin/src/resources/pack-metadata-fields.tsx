import {
  ArrayInput,
  AutocompleteArrayInput,
  Button,
  DateField,
  Labeled,
  NumberInput,
  SelectInput,
  SimpleFormIterator,
  TextInput,
  useNotify,
  useRecordContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { extractSamplePreviews } from '../api/packs-api.js';
import { adminColors } from '../theme/admin-colors.js';

const CONTENT_TAG_CHOICES = [
  { id: '词汇', name: '词汇' },
  { id: '上册', name: '上册' },
  { id: '下册', name: '下册' },
  { id: '全册', name: '全册' },
];

const INTRO_MEDIA_TYPE_CHOICES = [
  { id: 'image', name: '图片' },
  { id: 'video', name: '视频' },
];

function ExtractSamplePreviewsButton() {
  const { setValue } = useFormContext();
  const record = useRecordContext<{ packId?: string; currentPackVersion?: string }>();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      label="从当前发布版本抽取"
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
            const message = error instanceof Error ? error.message : '抽取失败';
            notify(message, { type: 'error' });
          } finally {
            setLoading(false);
          }
        })();
      }}
      sx={{ mb: 1 }}
    />
  );
}

function PackReadonlyStats() {
  const record = useRecordContext<{
    cardCount?: number;
    sizeLabel?: string;
    updatedAt?: string;
    currentPackVersion?: string;
  }>();

  if (!record) {
    return null;
  }

  return (
    <Box
      sx={{
        mt: 1,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${adminColors.border}`,
        bgcolor: adminColors.statTileBackground,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        发布统计（只读）
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        词条数、体积与更新时间由发布版本自动更新，此处不可编辑。
      </Typography>
      <Stack spacing={1}>
        <Labeled label="词条数">
          <Typography variant="body2">{record.cardCount ?? '—'}</Typography>
        </Labeled>
        <Labeled label="体积">
          <Typography variant="body2">{record.sizeLabel ?? '—'}</Typography>
        </Labeled>
        <Labeled label="当前版本">
          <Typography variant="body2">{record.currentPackVersion ?? '尚未发布'}</Typography>
        </Labeled>
        <Labeled label="更新时间">
          {record.updatedAt ? (
            <DateField source="updatedAt" record={record} showTime locales="zh-CN" />
          ) : (
            <Typography variant="body2">—</Typography>
          )}
        </Labeled>
      </Stack>
    </Box>
  );
}

export function PackMetadataFields() {
  return (
    <>
      <Divider sx={{ my: 2, width: '100%' }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 600, width: '100%' }}>
        运营展示字段
      </Typography>

      <AutocompleteArrayInput
        source="contentTags"
        label="内容标签"
        choices={CONTENT_TAG_CHOICES}
        fullWidth
        sx={{ width: '100%' }}
      />

      <Typography variant="subtitle2" sx={{ fontWeight: 600, width: '100%', mt: 1 }}>
        封面
      </Typography>
      <TextInput source="coverUrl" label="封面图 URL" fullWidth />
      <TextInput source="coverBadge" label="封面角标" fullWidth helperText="如 PEP 3A" />
      <ArrayInput source="coverLines" label="封面文案行">
        <SimpleFormIterator inline>
          <TextInput source="" label="文案" helperText={false} />
        </SimpleFormIterator>
      </ArrayInput>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, width: '100%', mt: 1 }}>
        包含内容
      </Typography>
      <ArrayInput source="includedHighlights" label="包含内容亮点（1～4 条）">
        <SimpleFormIterator inline>
          <TextInput source="title" label="标题" helperText={false} />
          <TextInput source="description" label="说明" multiline helperText={false} />
        </SimpleFormIterator>
      </ArrayInput>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, width: '100%', mt: 1 }}>
        内容介绍
      </Typography>
      <ArrayInput source="introMedia" label="介绍媒体">
        <SimpleFormIterator inline>
          <SelectInput source="type" label="类型" choices={INTRO_MEDIA_TYPE_CHOICES} helperText={false} />
          <TextInput source="url" label="URL" helperText={false} />
          <TextInput source="posterUrl" label="封面图 URL（视频可选）" helperText={false} />
          <NumberInput source="sortOrder" label="排序" helperText={false} />
        </SimpleFormIterator>
      </ArrayInput>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, width: '100%', mt: 1 }}>
        内容示例
      </Typography>
      <ExtractSamplePreviewsButton />
      <ArrayInput source="samplePreviews" label="示例词条">
        <SimpleFormIterator inline>
          <TextInput source="headword" label="单词" helperText={false} />
          <TextInput source="zh" label="释义" helperText={false} />
          <TextInput source="exampleEn" label="例句" helperText={false} />
          <TextInput source="previewAudioUrl" label="音频 URL" helperText={false} />
          <TextInput source="initial" label="首字母" helperText={false} />
        </SimpleFormIterator>
      </ArrayInput>

      <PackReadonlyStats />
    </>
  );
}

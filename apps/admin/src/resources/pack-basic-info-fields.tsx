import { AutocompleteArrayInput, NumberInput, SelectInput, TextInput, required } from 'react-admin';
import { useWatch } from 'react-hook-form';
import Grid from '@mui/material/Grid2';
import { Box, Typography } from '@mui/material';
import { formatMoney } from '../components/format-money.js';
import { packFormDensitySx } from '../components/pack-form-section.js';
import { PackTaxonomyFields } from './pack-taxonomy-fields.js';

const CONTENT_TAG_CHOICES = [
  { id: '词汇', name: '词汇' },
  { id: '上册', name: '上册' },
  { id: '下册', name: '下册' },
  { id: '全册', name: '全册' },
];

const packStatusFilterChoices = [
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已上架' },
];

function PricePreview() {
  const priceCents = useWatch<{ priceCents?: number }>({ name: 'priceCents' });
  const cents = typeof priceCents === 'number' ? priceCents : Number(priceCents) || 0;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
      = {formatMoney(cents)}
    </Typography>
  );
}

export function PackBasicInfoFields() {
  return (
    <Box sx={packFormDensitySx}>
      <Grid container spacing={1.5} sx={{ width: '100%' }}>
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
            choices={packStatusFilterChoices}
            fullWidth
            size="small"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextInput source="summary" label="简介" multiline fullWidth minRows={2} maxRows={4} size="small" />
        </Grid>
      </Grid>
    </Box>
  );
}

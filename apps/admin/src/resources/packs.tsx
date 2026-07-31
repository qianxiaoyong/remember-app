import {
  Create,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  List,
  NumberField,
  NumberInput,
  SelectInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
  required,
  useRecordContext,
} from 'react-admin';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { formatMoney } from '../components/format-money.js';
import { MonoText } from '../components/mono-text.js';
import { PackStatusChip } from '../components/pack-status-chip.js';
import { PackBasicInfoFields } from './pack-basic-info-fields.js';
import { PackEditSummary } from './pack-edit-summary.js';
import { PackFormToolbar } from './pack-form-toolbar.js';
import { PackMetadataFields } from './pack-metadata-fields.js';
import { PackTaxonomyFields } from './pack-taxonomy-fields.js';
import { PackVersionsPanel } from './pack-versions-panel.js';
import { PackRedemptionCodesPanel } from './pack-redemption-codes-panel.js';

const packChoices = [
  { id: 'primary', name: '小学' },
  { id: 'junior', name: '初中' },
  { id: 'senior', name: '高中' },
  { id: 'postgraduate', name: '考研' },
];

const packCategoryLabels: Record<string, string> = {
  primary: '小学',
  junior: '初中',
  senior: '高中',
  postgraduate: '考研',
};

const packStatusFilterChoices = [
  { id: 'draft', name: '草稿' },
  { id: 'published', name: '已上架' },
];

const packListFilters = [
  <TextInput key="q" source="q" label="搜索标题 / 知识库 ID" alwaysOn resettable />,
  <SelectInput key="status" source="status" label="状态" choices={packStatusFilterChoices} alwaysOn />,
  <SelectInput key="primaryCategory" source="primaryCategory" label="大类" choices={packChoices} />,
];

function PackEditTitle() {
  const record = useRecordContext<{ title?: string }>();
  return <span>{record?.title ?? '编辑知识库'}</span>;
}

function PackEditTabs() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Box sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(_event, nextTab: number) => {
            setTab(nextTab);
          }}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5, fontSize: '0.875rem' } }}
        >
          <Tab label="基础信息" />
          <Tab label="展示与营销" />
          <Tab label="版本与发布" />
          <Tab label="兑换码" />
        </Tabs>
      </Box>

      <Box
        sx={{
          display: tab === 0 || tab === 1 ? 'block' : 'none',
          px: 1.5,
          pt: 1,
          pb: 0,
        }}
      >
        <SimpleForm toolbar={tab === 0 || tab === 1 ? <PackFormToolbar /> : false}>
          <Box sx={{ display: tab === 0 ? 'block' : 'none', width: '100%' }}>
            <PackBasicInfoFields />
          </Box>
          <Box sx={{ display: tab === 1 ? 'block' : 'none', width: '100%' }}>
            <PackMetadataFields />
          </Box>
        </SimpleForm>
      </Box>

      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <PackVersionsPanel embedded />
      </Box>
      <Box sx={{ display: tab === 3 ? 'block' : 'none' }}>
        <PackRedemptionCodesPanel />
      </Box>
    </>
  );
}

export function PackList() {
  return (
    <List filters={packListFilters} sort={{ field: 'updatedAt', order: 'DESC' }} perPage={25}>
      <Datagrid rowClick="edit" bulkActionButtons={false}>
        <FunctionField
          label="知识库 ID"
          render={(record: { packId?: string }) => <MonoText>{record.packId ?? '—'}</MonoText>}
        />
        <TextField source="title" label="标题" />
        <FunctionField
          label="大类"
          render={(record: { primaryCategory?: string }) =>
            packCategoryLabels[record.primaryCategory ?? ''] ?? record.primaryCategory ?? '—'
          }
        />
        <FunctionField
          label="状态"
          render={(record: { status?: string }) =>
            record.status ? <PackStatusChip status={record.status} /> : '—'
          }
        />
        <FunctionField
          label="售价"
          render={(record: { priceCents?: number }) => formatMoney(record.priceCents ?? 0)}
        />
        <TextField source="currentPackVersion" label="当前版本" emptyText="—" />
        <DateField source="updatedAt" label="更新时间" showTime locales="zh-CN" />
      </Datagrid>
    </List>
  );
}

export function PackEdit() {
  return (
    <Edit title={<PackEditTitle />}>
      <>
        <PackEditSummary />
        <PackEditTabs />
      </>
    </Edit>
  );
}

export function PackCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="packId" label="知识库 ID" validate={required()} fullWidth />
        <TextInput source="title" label="标题" validate={required()} fullWidth />
        <PackTaxonomyFields />
        <NumberInput
          source="priceCents"
          label="售价（分）"
          defaultValue={1990}
          helperText="例如 1990 = ¥19.90"
          fullWidth
        />
        <TextInput
          source="summary"
          label="简介"
          multiline
          validate={required()}
          fullWidth
          minRows={3}
        />
      </SimpleForm>
    </Create>
  );
}

export function PackShow() {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="packId" label="知识库 ID" />
        <TextField source="title" label="标题" />
        <FunctionField
          label="状态"
          render={(record: { status?: string }) =>
            record.status ? <PackStatusChip status={record.status} /> : '—'
          }
        />
        <FunctionField
          label="售价"
          render={(record: { priceCents?: number }) => formatMoney(record.priceCents ?? 0)}
        />
        <NumberField source="protocolVersion" label="协议版本" emptyText="—" />
      </SimpleShowLayout>
    </Show>
  );
}

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
import { AdminPageHeader } from '../components/admin-page-header.js';
import { packCatalogFormSurfaceSx } from '../components/admin-form-section.js';
import { AdminPanel } from '../components/admin-panel.js';
import { packEditFormSx } from '../components/pack-form-section.js';
import { formatMoney } from '../components/format-money.js';
import { ListCreateActions } from '../components/list-toolbar.js';
import { MonoText } from '../components/mono-text.js';
import { PackStatusChip } from '../components/pack-status-chip.js';
import {
  PackCatalogDetailFields,
} from './pack-catalog-detail-fields.js';
import { PackEditSummaryMeta } from './pack-edit-summary.js';
import { PackSaveButton } from './pack-save-button.js';
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

function PackEditTitleRecord() {
  const record = useRecordContext<{ title?: string; packId?: string }>();
  return <>{record?.title ?? record?.packId ?? '编辑知识库'}</>;
}

function PackEditTabs() {
  const [tab, setTab] = useState(0);

  const tabs = (
    <Tabs
      value={tab}
      onChange={(_event, nextTab: number) => {
        setTab(nextTab);
      }}
      sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0.5, fontSize: '0.875rem' } }}
    >
      <Tab label="目录与详情" />
      <Tab label="版本与发布" />
      <Tab label="兑换码" />
    </Tabs>
  );

  if (tab === 0) {
    return (
      <SimpleForm toolbar={false} sx={packEditFormSx}>
        <Box sx={{ width: '100%', ...packCatalogFormSurfaceSx, overflow: 'hidden' }}>
          <AdminPageHeader
            embedded
            title={<PackEditTitleRecord />}
            meta={<PackEditSummaryMeta />}
            actions={<PackSaveButton />}
            tabs={tabs}
          />
          <PackCatalogDetailFields embedded />
        </Box>
      </SimpleForm>
    );
  }

  return (
    <>
      <AdminPageHeader title={<PackEditTitleRecord />} meta={<PackEditSummaryMeta />} tabs={tabs} />
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <PackVersionsPanel embedded />
      </Box>
      <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
        <PackRedemptionCodesPanel />
      </Box>
    </>
  );
}

export function PackList() {
  return (
    <>
      <AdminPageHeader title="知识库" meta="管理目录、发版与运营展示信息" />
      <List
        title={false}
        filters={packListFilters}
        actions={<ListCreateActions label="新建知识库" />}
        sort={{ field: 'updatedAt', order: 'DESC' }}
        perPage={25}
      >
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
    </>
  );
}

export function PackEdit() {
  return (
    <Edit title={false} actions={false} component="div">
      <PackEditTabs />
    </Edit>
  );
}

export function PackCreate() {
  return (
    <Create title={false} component="div">
      <AdminPageHeader title="新建知识库" meta="创建后可继续编辑展示信息与发版" />
      <SimpleForm sx={packEditFormSx}>
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
    <Show title={false} actions={false} component="div">
      <AdminPageHeader title={<PackEditTitleRecord />} meta="知识库只读概览" />
      <AdminPanel title="基本信息">
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
      </AdminPanel>
    </Show>
  );
}

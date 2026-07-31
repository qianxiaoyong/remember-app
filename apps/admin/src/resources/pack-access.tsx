import {
  Create,
  Datagrid,
  DateField,
  FunctionField,
  List,
  SimpleForm,
  TextField,
  TextInput,
  required,
} from 'react-admin';
import { MonoText } from '../components/mono-text.js';
import { PackAccessSourceChip } from '../components/admin-status-chips.js';
import { ListCreateActions } from '../components/list-toolbar.js';

const packAccessFilters = [
  <TextInput key="packId" source="packId" label="知识库 ID" alwaysOn resettable />,
  <TextInput key="userId" source="userId" label="用户 UUID" resettable />,
];

export function PackAccessList() {
  return (
    <List
      filters={packAccessFilters}
      actions={<ListCreateActions label="补发权益" />}
      sort={{ field: 'grantedAt', order: 'DESC' }}
      perPage={20}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source="maskedPhone" label="用户" />
        <TextField source="packTitle" label="知识库" />
        <FunctionField
          label="知识库 ID"
          render={(record: { packId?: string }) => <MonoText variant="caption">{record.packId ?? '—'}</MonoText>}
        />
        <FunctionField
          label="来源"
          render={(record: { source?: string }) =>
            record.source ? <PackAccessSourceChip source={record.source} /> : '—'
          }
        />
        <DateField source="grantedAt" label="发放时间" showTime locales="zh-CN" />
      </Datagrid>
    </List>
  );
}

export function PackAccessGrantCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="userId" label="用户 UUID" validate={required()} fullWidth />
        <TextInput source="packId" label="知识库 ID" validate={required()} fullWidth />
        <TextInput source="note" label="备注（写入审计）" fullWidth multiline minRows={2} />
      </SimpleForm>
    </Create>
  );
}

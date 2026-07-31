import {
  Create,
  Datagrid,
  DateField,
  FunctionField,
  List,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  required,
} from 'react-admin';
import { Alert, Box, Typography } from '@mui/material';
import { MonoText } from '../components/mono-text.js';
import { RedemptionStatusChip } from '../components/admin-status-chips.js';
import { ListCreateActions } from '../components/list-toolbar.js';

export function RefundCreate() {
  return (
    <Create>
      <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          发起退款
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          当前仅支持 dev/mock 退款链路；生产环境需接入真实微信支付后再使用。
        </Alert>
        <SimpleForm>
          <TextInput
            source="orderId"
            label="订单 UUID"
            validate={required()}
            fullWidth
            helperText="可在订单详情页复制完整订单号"
          />
          <TextInput source="reason" label="退款原因" fullWidth multiline minRows={2} />
        </SimpleForm>
      </Box>
    </Create>
  );
}

const redemptionFilters = [
  <TextInput key="packId" source="packId" label="知识库 ID" alwaysOn resettable />,
  <SelectInput
    key="status"
    source="status"
    label="状态"
    choices={[{ id: 'active', name: '可用' }]}
  />,
];

export function RedemptionCodeList() {
  return (
    <List
      filters={redemptionFilters}
      actions={<ListCreateActions label="批量生成" />}
      sort={{ field: 'createdAt', order: 'DESC' }}
      perPage={20}
    >
      <Datagrid bulkActionButtons={false}>
        <FunctionField
          label="知识库 ID"
          render={(record: { packId?: string }) => (
            <MonoText variant="caption">{record.packId ?? '—'}</MonoText>
          )}
        />
        <TextField source="codePreview" label="码预览" />
        <FunctionField
          label="状态"
          render={(record: { status?: string }) =>
            record.status ? <RedemptionStatusChip status={record.status} /> : '—'
          }
        />
        <NumberField source="redeemedCount" label="已兑换" />
        <NumberField source="maxRedemptions" label="上限" />
        <DateField source="createdAt" label="创建时间" showTime locales="zh-CN" />
      </Datagrid>
    </List>
  );
}

export function RedemptionBatchCreate() {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="packId" label="知识库 ID" validate={required()} fullWidth />
        <NumberInput source="count" label="生成数量" defaultValue={10} validate={required()} fullWidth />
        <NumberInput source="maxRedemptions" label="每码可兑次数" defaultValue={1} fullWidth />
        <TextInput source="prefix" label="码前缀" defaultValue="REDEEM" fullWidth />
      </SimpleForm>
    </Create>
  );
}

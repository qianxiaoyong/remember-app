import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  FunctionField,
  List,
  NumberField,
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
import { RedemptionBatchCreate } from './redemption-batch-create.js';
import { RedemptionCodeRowActions } from './redemption-code-row-actions.js';

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
  <TextInput key="keyword" source="keyword" label="兑换码" resettable />,
  <SelectInput
    key="status"
    source="status"
    label="状态"
    choices={[
      { id: 'active', name: '可用' },
      { id: 'disabled', name: '已停用' },
      { id: 'deleted', name: '已删除' },
    ]}
  />,
  <BooleanInput key="includeDeleted" source="includeDeleted" label="含已删除" />,
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
        <FunctionField
          label="兑换码"
          render={(record: { code?: string; codePreview?: string }) => (
            <MonoText variant="caption">{record.code ?? record.codePreview ?? '—'}</MonoText>
          )}
        />
        <FunctionField
          label="状态"
          render={(record: { status?: string; isExhausted?: boolean }) =>
            record.status ? (
              <RedemptionStatusChip
                isExhausted={record.isExhausted === true}
                status={record.status}
              />
            ) : (
              '—'
            )
          }
        />
        <NumberField source="redeemedCount" label="已兑换" />
        <NumberField source="maxRedemptions" label="上限" />
        <DateField source="expiresAt" label="过期时间" showTime locales="zh-CN" emptyText="—" />
        <TextField source="note" label="备注" emptyText="—" />
        <DateField source="createdAt" label="创建时间" showTime locales="zh-CN" />
        <FunctionField
          label="操作"
          render={(record) => <RedemptionCodeRowActions record={record} />}
        />
      </Datagrid>
    </List>
  );
}

export { RedemptionBatchCreate };

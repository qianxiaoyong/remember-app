import {
  Datagrid,
  DateField,
  FunctionField,
  List,
  SelectInput,
  TextField,
  TextInput,
} from 'react-admin';
import { AdminPageHeader } from '../components/admin-page-header.js';
import { formatMoney } from '../components/format-money.js';
import { MonoText } from '../components/mono-text.js';
import { OrderStatusChip } from '../components/admin-status-chips.js';
import { EmptyListActions } from '../components/list-toolbar.js';
import { OrderShow } from './order-show.js';

export { OrderShow };

const orderStatusChoices = [
  { id: 'pending', name: '待支付' },
  { id: 'paid', name: '已支付' },
  { id: 'refunding', name: '退款中' },
  { id: 'refunded', name: '已退款' },
  { id: 'closed', name: '已关闭' },
];

const orderFilters = [
  <TextInput key="packId" source="packId" label="知识库 ID" alwaysOn resettable />,
  <TextInput key="userId" source="userId" label="用户 UUID" resettable />,
  <SelectInput key="status" source="status" label="状态" choices={orderStatusChoices} alwaysOn />,
];

export function OrderList() {
  return (
    <>
      <AdminPageHeader title="订单" meta="支付、退款与订单状态查询" />
      <List
        title={false}
        filters={orderFilters}
        actions={<EmptyListActions />}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={20}
      >
      <Datagrid rowClick="show" bulkActionButtons={false}>
        <FunctionField
          label="订单号"
          render={(record: { orderId?: string }) => (
            <MonoText variant="caption">{record.orderId?.slice(0, 8) ?? '—'}…</MonoText>
          )}
        />
        <TextField source="maskedPhone" label="用户" />
        <TextField source="packTitle" label="知识库" />
        <FunctionField
          label="金额"
          render={(record: { amountCents?: number }) => formatMoney(record.amountCents ?? 0)}
        />
        <FunctionField
          label="状态"
          render={(record: { status?: string }) =>
            record.status ? <OrderStatusChip status={record.status} /> : '—'
          }
        />
        <DateField source="createdAt" label="创建时间" showTime locales="zh-CN" />
      </Datagrid>
    </List>
    </>
  );
}

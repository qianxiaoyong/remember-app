import { Datagrid, DateField, FunctionField, List, TextField, TextInput } from 'react-admin';
import { AdminPageHeader } from '../components/admin-page-header.js';
import { MonoText } from '../components/mono-text.js';
import { AuditResultChip, formatAuditAction } from '../components/admin-status-chips.js';
import { EmptyListActions } from '../components/list-toolbar.js';

const auditFilters = [
  <TextInput key="action" source="action" label="动作" alwaysOn resettable />,
  <TextInput key="targetType" source="targetType" label="对象类型" resettable />,
];

export function AuditLogList() {
  return (
    <>
      <AdminPageHeader title="审计日志" meta="后台操作记录与结果追踪" />
      <List
        title={false}
        filters={auditFilters}
        actions={<EmptyListActions />}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={30}
      >
      <Datagrid bulkActionButtons={false}>
        <DateField source="createdAt" label="时间" showTime locales="zh-CN" />
        <TextField source="actorLoginName" label="操作者" />
        <FunctionField
          label="动作"
          render={(record: { action?: string }) => formatAuditAction(record.action ?? '')}
        />
        <TextField source="targetType" label="对象类型" />
        <FunctionField
          label="对象 ID"
          render={(record: { targetId?: string }) => (
            <MonoText variant="caption">{record.targetId ?? '—'}</MonoText>
          )}
        />
        <FunctionField
          label="结果"
          render={(record: { result?: string }) =>
            record.result ? <AuditResultChip result={record.result} /> : '—'
          }
        />
      </Datagrid>
    </List>
    </>
  );
}

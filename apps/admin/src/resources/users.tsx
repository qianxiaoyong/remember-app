import type { ReactNode } from 'react';
import {
  Button,
  Datagrid,
  DateField,
  FunctionField,
  List,
  Show,
  TextField,
  TextInput,
  useRecordContext,
  useRedirect,
} from 'react-admin';
import { Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { AdminPageHeader } from '../components/admin-page-header.js';
import { AdminPanel } from '../components/admin-panel.js';
import { CopyableMonoText } from '../components/copyable-mono-text.js';
import { EmptyListActions } from '../components/list-toolbar.js';
import { MonoText } from '../components/mono-text.js';

const userFilters = [
  <TextInput key="maskedPhone" source="maskedPhone" label="脱敏手机号" alwaysOn resettable />,
  <TextInput key="userId" source="userId" label="用户 UUID" resettable />,
];

function UserListEmpty() {
  return (
    <Box sx={{ py: 4, textAlign: 'center' }}>
      <Typography color="text.secondary" gutterBottom>
        暂无 App 用户
      </Typography>
      <Typography variant="body2" color="text.secondary">
        用户通过手机号注册后出现在此；知识库权益请在「用户权益」查看
      </Typography>
    </Box>
  );
}

export function UserList() {
  return (
    <>
      <AdminPageHeader title="App 用户" meta="只读查看注册用户；不含完整手机号" />
      <List
        title={false}
        filters={userFilters}
        actions={<EmptyListActions />}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={20}
        empty={<UserListEmpty />}
      >
        <Datagrid rowClick="show" bulkActionButtons={false}>
          <TextField source="maskedPhone" label="脱敏手机号" />
          <FunctionField
            label="用户 ID"
            render={(record: { userId?: string }) =>
              record.userId ? (
                <CopyableMonoText value={record.userId} variant="caption">
                  {`${record.userId.slice(0, 8)}…`}
                </CopyableMonoText>
              ) : (
                '—'
              )
            }
          />
          <TextField source="displayName" label="昵称" emptyText="—" />
          <FunctionField
            label="权益数"
            render={(record: { packAccessCount?: number }) => String(record.packAccessCount ?? 0)}
          />
          <FunctionField
            label="支付订单"
            render={(record: { paidOrderCount?: number }) => String(record.paidOrderCount ?? 0)}
          />
          <DateField source="createdAt" label="注册时间" showTime locales="zh-CN" />
          <DateField
            source="lastActiveAt"
            label="最近活跃"
            showTime
            locales="zh-CN"
            emptyText="—"
          />
        </Datagrid>
      </List>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 112, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function UserShowActions() {
  const record = useRecordContext<{ userId?: string }>();
  const redirect = useRedirect();

  if (!record?.userId) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          redirect('list', 'orders', undefined, {
            filter: { userId: record.userId },
          });
        }}
      >
        查看订单
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          redirect('list', 'pack-access', undefined, {
            filter: { userId: record.userId },
          });
        }}
      >
        查看权益
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          redirect(`/pack-access/create?userId=${encodeURIComponent(record.userId ?? '')}`);
        }}
      >
        补发权益
      </Button>
    </Stack>
  );
}

function UserShowContent() {
  const record = useRecordContext<{
    userId?: string;
    maskedPhone?: string;
    displayName?: string;
    status?: string;
    mainDeviceId?: string;
    packAccessCount?: number;
    paidOrderCount?: number;
    createdAt?: string;
    updatedAt?: string;
    lastActiveAt?: string;
  }>();

  if (!record) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <AdminPanel title="基本信息">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="用户 ID">
              {record.userId ? <CopyableMonoText value={record.userId} /> : '—'}
            </InfoRow>
            <InfoRow label="脱敏手机号">{record.maskedPhone ?? '—'}</InfoRow>
            <InfoRow label="昵称">{record.displayName ?? '—'}</InfoRow>
            <InfoRow label="状态">{record.status ?? '—'}</InfoRow>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoRow label="权益数">{String(record.packAccessCount ?? 0)}</InfoRow>
            <InfoRow label="支付订单">{String(record.paidOrderCount ?? 0)}</InfoRow>
            <InfoRow label="注册时间">
              {record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '—'}
            </InfoRow>
            <InfoRow label="最近活跃">
              {record.lastActiveAt ? new Date(record.lastActiveAt).toLocaleString('zh-CN') : '—'}
            </InfoRow>
            {record.mainDeviceId ? (
              <InfoRow label="主设备">
                <MonoText>{record.mainDeviceId}</MonoText>
              </InfoRow>
            ) : null}
          </Grid>
        </Grid>
      </AdminPanel>
      <UserShowActions />
    </Stack>
  );
}

function UserShowTitle() {
  const record = useRecordContext<{ maskedPhone?: string }>();
  return <>用户 {record?.maskedPhone ?? '详情'}</>;
}

export function UserShow() {
  return (
    <Show title={false} actions={false} component="div">
      <AdminPageHeader title={<UserShowTitle />} meta="App 注册用户 · 只读" />
      <UserShowContent />
    </Show>
  );
}

import type { ReactNode } from 'react';
import {
  ArrayField,
  Datagrid,
  DateField,
  FunctionField,
  Show,
  TextField,
  useRecordContext,
} from 'react-admin';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { formatMoney } from '../components/format-money.js';
import { MonoText } from '../components/mono-text.js';
import { OrderStatusChip } from '../components/admin-status-chips.js';
import { adminColors } from '../theme/admin-colors.js';

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 96, flexShrink: 0 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function OrderShowContent() {
  const record = useRecordContext<{
    orderId?: string;
    maskedPhone?: string;
    packTitle?: string;
    packId?: string;
    amountCents?: number;
    status?: string;
    channel?: string;
    sourceCode?: string;
    createdAt?: string;
    updatedAt?: string;
  }>();

  if (!record) {
    return null;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              订单详情
            </Typography>
            {record.status ? <OrderStatusChip status={record.status} /> : null}
          </Stack>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow label="订单号">
                <MonoText>{record.orderId ?? '—'}</MonoText>
              </InfoRow>
              <InfoRow label="用户">{record.maskedPhone ?? '—'}</InfoRow>
              <InfoRow label="支付渠道">{record.channel ?? '—'}</InfoRow>
              {record.sourceCode ? (
                <InfoRow label="来源码">
                  <MonoText>{record.sourceCode}</MonoText>
                </InfoRow>
              ) : null}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <InfoRow label="知识库">{record.packTitle ?? record.packId ?? '—'}</InfoRow>
              <InfoRow label="金额">
                <Typography variant="body2" sx={{ fontWeight: 700, color: adminColors.price }}>
                  {formatMoney(record.amountCents ?? 0)}
                </Typography>
              </InfoRow>
              <InfoRow label="创建时间">
                {record.createdAt ? new Date(record.createdAt).toLocaleString('zh-CN') : '—'}
              </InfoRow>
              <InfoRow label="更新时间">
                {record.updatedAt ? new Date(record.updatedAt).toLocaleString('zh-CN') : '—'}
              </InfoRow>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            支付事件
          </Typography>
          <ArrayField source="paymentEvents">
            <Datagrid bulkActionButtons={false}>
              <TextField source="notificationId" label="通知 ID" />
              <TextField source="transactionId" label="微信流水号" />
              <DateField source="processedAt" label="处理时间" showTime locales="zh-CN" />
            </Datagrid>
          </ArrayField>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            退款记录
          </Typography>
          <ArrayField source="refunds">
            <Datagrid bulkActionButtons={false}>
              <FunctionField
                label="退款 ID"
                render={(row: { refundId?: string }) => <MonoText>{row.refundId ?? '—'}</MonoText>}
              />
              <TextField source="status" label="状态" />
              <DateField source="createdAt" label="创建时间" showTime locales="zh-CN" />
            </Datagrid>
          </ArrayField>
        </CardContent>
      </Card>
    </Box>
  );
}

export function OrderShow() {
  return (
    <Show>
      <OrderShowContent />
    </Show>
  );
}

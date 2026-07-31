import { Chip } from '@mui/material';
import { adminColors } from '../theme/admin-colors.js';

interface StatusChipStyle {
  label: string;
  color: string;
  background: string;
}

function resolveStatusConfig(
  status: string,
  configMap: Record<string, StatusChipStyle>,
): StatusChipStyle {
  return (
    configMap[status] ?? {
      label: status,
      color: adminColors.textSecondary,
      background: adminColors.statTileBackground,
    }
  );
}

function StatusChip({ config }: { config: StatusChipStyle }) {
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        height: 24,
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.background,
      }}
    />
  );
}

const orderStatusConfig: Record<string, StatusChipStyle> = {
  pending: { label: '待支付', color: adminColors.warning, background: 'rgba(240, 160, 75, 0.14)' },
  paid: { label: '已支付', color: adminColors.success, background: 'rgba(92, 184, 138, 0.14)' },
  refunding: { label: '退款中', color: adminColors.price, background: 'rgba(239, 112, 88, 0.14)' },
  refunded: { label: '已退款', color: adminColors.textSecondary, background: adminColors.statTileBackground },
  closed: { label: '已关闭', color: adminColors.textMuted, background: adminColors.statTileBackground },
};

export function OrderStatusChip({ status }: { status: string }) {
  return <StatusChip config={resolveStatusConfig(status, orderStatusConfig)} />;
}

const redemptionStatusConfig: Record<string, StatusChipStyle> = {
  active: { label: '可用', color: adminColors.success, background: 'rgba(92, 184, 138, 0.14)' },
};

export function RedemptionStatusChip({ status }: { status: string }) {
  return <StatusChip config={resolveStatusConfig(status, redemptionStatusConfig)} />;
}

const packAccessSourceLabels: Record<string, string> = {
  admin_grant: '人工补发',
  purchase: '购买',
  redemption: '兑换码',
};

export function PackAccessSourceChip({ source }: { source: string }) {
  const label = packAccessSourceLabels[source] ?? source;
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{ height: 24, borderColor: adminColors.border, color: adminColors.textSecondary }}
    />
  );
}

const auditResultConfig: Record<string, StatusChipStyle> = {
  success: { label: '成功', color: adminColors.success, background: 'rgba(92, 184, 138, 0.14)' },
  failure: { label: '失败', color: adminColors.error, background: 'rgba(232, 107, 92, 0.14)' },
};

export function AuditResultChip({ result }: { result: string }) {
  return <StatusChip config={resolveStatusConfig(result, auditResultConfig)} />;
}

const auditActionLabels: Record<string, string> = {
  'pack_version.upload': '上传知识库版本',
  'pack_version.publish': '发布知识库版本',
  'pack_access.grant': '补发用户权益',
  'refund.create': '发起退款',
};

export function formatAuditAction(action: string): string {
  return auditActionLabels[action] ?? action;
}

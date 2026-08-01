import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Grid from '@mui/material/Grid2';
import type { AdminDashboardRange } from '@remember/contracts';
import {
  adminDashboardAlertsSchema,
  adminDashboardRevenueSeriesSchema,
  adminDashboardSummarySchema,
  adminDashboardTopPacksSchema,
} from '@remember/contracts';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { useRedirect } from 'react-admin';
import { AdminPageHeader } from '../components/admin-page-header.js';
import { formatMoney } from '../components/format-money.js';
import { DashboardSectionCard, KpiStatCard } from '../components/dashboard-cards.js';
import { adminColors } from '../theme/admin-colors.js';
import { adminFetchJson } from '../api/admin-api-client.js';
import {
  alertTargetResource,
  dashboardChartColors,
  dashboardKpiAccents,
  dashboardRangeLabels,
} from './dashboard-config.js';

function formatChartDate(date: string): string {
  const parts = date.split('-');
  const month = parts[1];
  const day = parts[2];
  if (!month || !day) {
    return date;
  }
  return `${month}-${day}`;
}

function RevenueTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload as
    { date?: string; paidAmountCents?: number; paidOrderCount?: number } | undefined;

  if (!point) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: adminColors.surface,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1.5,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {point.date}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        GMV {formatMoney(point.paidAmountCents ?? 0)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        订单 {String(point.paidOrderCount ?? 0)} 笔
      </Typography>
    </Box>
  );
}

function TopPackTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload as
    { title?: string; paidOrderCount?: number; paidAmountCents?: number } | undefined;

  if (!item) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        bgcolor: adminColors.surface,
        border: `1px solid ${adminColors.border}`,
        borderRadius: 1.5,
        maxWidth: 240,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        销量 {String(item.paidOrderCount ?? 0)} · {formatMoney(item.paidAmountCents ?? 0)}
      </Typography>
    </Box>
  );
}

function PackStatTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 120,
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: adminColors.statTileBackground,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
        {String(value)}
      </Typography>
    </Box>
  );
}

function resolveRegisteredSince(range: AdminDashboardRange): string {
  const start = new Date();
  if (range === '1d') {
    start.setDate(start.getDate() - 1);
  } else if (range === '7d') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  return start.toISOString();
}

export function Dashboard() {
  const redirect = useRedirect();
  const [range, setRange] = useState<AdminDashboardRange>('7d');
  const [summary, setSummary] = useState(() =>
    adminDashboardSummarySchema.parse({
      range: '7d',
      paidAmountCents: 0,
      paidOrderCount: 0,
      refundAmountCents: 0,
      redemptionCount: 0,
      newUserCount: 0,
      activeLoginCount: 0,
      publishedPackCount: 0,
      draftPackCount: 0,
    }),
  );
  const [revenue, setRevenue] = useState(() =>
    adminDashboardRevenueSeriesSchema.parse({ range: '30d', points: [] }),
  );
  const [topPacks, setTopPacks] = useState(() =>
    adminDashboardTopPacksSchema.parse({ range: '30d', items: [] }),
  );
  const [alerts, setAlerts] = useState(() => adminDashboardAlertsSchema.parse({ items: [] }));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryJson, revenueJson, topJson, alertsJson] = await Promise.all([
          adminFetchJson(`/admin/dashboard/summary?range=${range}`),
          adminFetchJson(`/admin/dashboard/revenue-series?range=30d`),
          adminFetchJson(`/admin/dashboard/top-packs?range=30d`),
          adminFetchJson('/admin/dashboard/alerts'),
        ]);
        if (cancelled) {
          return;
        }
        setSummary(adminDashboardSummarySchema.parse(summaryJson));
        setRevenue(adminDashboardRevenueSeriesSchema.parse(revenueJson));
        setTopPacks(adminDashboardTopPacksSchema.parse(topJson));
        setAlerts(adminDashboardAlertsSchema.parse(alertsJson));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '加载失败');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <Box>
      <AdminPageHeader
        title="运营驾驶舱"
        meta={
          <>
            统计范围：{dashboardRangeLabels[range]}
            {loading ? ' · 加载中…' : null}
          </>
        }
        actions={
          <Select
            size="small"
            value={range}
            onChange={(event) => {
              setRange(event.target.value as AdminDashboardRange);
            }}
            sx={{ minWidth: 120, bgcolor: adminColors.surface }}
          >
            <MenuItem value="1d">今日</MenuItem>
            <MenuItem value="7d">近 7 天</MenuItem>
            <MenuItem value="30d">近 30 天</MenuItem>
          </Select>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="支付成功额"
            value={formatMoney(summary.paidAmountCents)}
            accent={dashboardKpiAccents.revenue}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="支付笔数"
            value={String(summary.paidOrderCount)}
            accent={dashboardKpiAccents.orders}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="退款额"
            value={formatMoney(summary.refundAmountCents)}
            accent={dashboardKpiAccents.refund}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="兑换成功"
            value={String(summary.redemptionCount)}
            accent={dashboardKpiAccents.redemption}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="新注册"
            value={String(summary.newUserCount)}
            accent={dashboardKpiAccents.users}
            hint="点击查看用户列表"
            onClick={() => {
              redirect('list', 'users', undefined, {
                registeredSince: resolveRegisteredSince(range),
              });
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiStatCard
            label="活跃登录"
            value={String(summary.activeLoginCount)}
            accent={dashboardKpiAccents.active}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <DashboardSectionCard title="近 30 日 GMV" subtitle="按支付成功订单汇总">
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.points}>
                  <CartesianGrid stroke={dashboardChartColors.grid} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartDate}
                    tick={{ fill: dashboardChartColors.axis, fontSize: 12 }}
                    axisLine={{ stroke: dashboardChartColors.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => formatMoney(Number(value))}
                    tick={{ fill: dashboardChartColors.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={72}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="paidAmountCents"
                    stroke={dashboardChartColors.line}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <DashboardSectionCard title="知识库销量 Top5" subtitle="近 30 天支付笔数">
            <Box height={280}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPacks.items} barCategoryGap="20%">
                  <CartesianGrid stroke={dashboardChartColors.grid} strokeDasharray="3 3" />
                  <XAxis dataKey="title" hide />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: dashboardChartColors.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<TopPackTooltip />} cursor={{ fill: adminColors.accentSoft }} />
                  <Bar
                    dataKey="paidOrderCount"
                    fill={dashboardChartColors.bar}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard
            title="待处理告警"
            subtitle={alerts.items.length > 0 ? '点击查看相关列表' : '当前无待办'}
          >
            {alerts.items.length === 0 ? (
              <Typography color="text.secondary">暂无告警</Typography>
            ) : (
              <List disablePadding>
                {alerts.items.map((item) => (
                  <ListItemButton
                    key={item.kind}
                    sx={{
                      px: 1.5,
                      mb: 1,
                      borderRadius: 2,
                      border: `1px solid ${adminColors.border}`,
                      bgcolor: adminColors.surface,
                    }}
                    onClick={() => {
                      redirect('list', alertTargetResource(item.kind));
                    }}
                  >
                    <ListItemText
                      primary={item.message}
                      secondary={`${String(item.count)} 项待处理`}
                      slotProps={{ primary: { fontWeight: 600 } }}
                    />
                    <Chip
                      label={String(item.count)}
                      size="small"
                      sx={{
                        mr: 1,
                        bgcolor: adminColors.accentSoft,
                        color: adminColors.accent,
                        fontWeight: 700,
                      }}
                    />
                    <ChevronRightIcon sx={{ color: adminColors.textMuted }} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title="知识库状态" subtitle="目录上架情况概览">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <PackStatTile
                label="已上架"
                value={summary.publishedPackCount}
                accent={adminColors.success}
              />
              <PackStatTile
                label="草稿"
                value={summary.draftPackCount}
                accent={adminColors.warning}
              />
            </Stack>
            <ListItemButton
              sx={{
                px: 1.5,
                borderRadius: 2,
                border: `1px solid ${adminColors.border}`,
              }}
              onClick={() => {
                redirect('list', 'packs');
              }}
            >
              <ListItemText primary="管理知识库目录" secondary="查看全部 pack 与发版状态" />
              <ChevronRightIcon sx={{ color: adminColors.textMuted }} />
            </ListItemButton>
          </DashboardSectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

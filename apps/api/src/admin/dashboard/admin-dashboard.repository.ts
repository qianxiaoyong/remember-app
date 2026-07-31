import { Injectable } from '@nestjs/common';
import type { AdminDashboardRange } from '@remember/contracts';
import { PrismaService } from '../../prisma/prisma.service.js';

function resolveRangeStart(range: AdminDashboardRange, now: Date): Date {
  const start = new Date(now);
  if (range === '1d') {
    start.setDate(start.getDate() - 1);
    return start;
  }
  if (range === '7d') {
    start.setDate(start.getDate() - 7);
    return start;
  }
  start.setDate(start.getDate() - 30);
  return start;
}

@Injectable()
export class AdminDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(range: AdminDashboardRange, now: Date) {
    const rangeStart = resolveRangeStart(range, now);

    const paidOrders = await this.prisma.order.findMany({
      where: { status: 'paid', updatedAt: { gte: rangeStart } },
      select: { amountCents: true },
    });
    const paidAmountCents = paidOrders.reduce((sum, row) => sum + row.amountCents, 0);

    const refundedOrders = await this.prisma.order.findMany({
      where: { status: 'refunded', updatedAt: { gte: rangeStart } },
      select: { amountCents: true },
    });
    const refundAmountCents = refundedOrders.reduce((sum, row) => sum + row.amountCents, 0);

    const [redemptionCount, newUserCount, activeLoginCount, publishedPackCount, draftPackCount] =
      await Promise.all([
        this.prisma.redemptionEvent.count({ where: { redeemedAt: { gte: rangeStart } } }),
        this.prisma.user.count({ where: { createdAt: { gte: rangeStart } } }),
        this.prisma.session.count({
          where: { lastActiveAt: { gte: rangeStart }, revokedAt: null },
        }),
        this.prisma.pack.count({ where: { status: 'published' } }),
        this.prisma.pack.count({ where: { status: 'draft' } }),
      ]);

    return {
      range,
      paidAmountCents,
      paidOrderCount: paidOrders.length,
      refundAmountCents,
      redemptionCount,
      newUserCount,
      activeLoginCount,
      publishedPackCount,
      draftPackCount,
    };
  }

  async getRevenueSeries(range: AdminDashboardRange, now: Date) {
    const rangeStart = resolveRangeStart(range, now);
    const orders = await this.prisma.order.findMany({
      where: { status: 'paid', updatedAt: { gte: rangeStart } },
      select: { amountCents: true, updatedAt: true },
      orderBy: { updatedAt: 'asc' },
    });

    const buckets = new Map<string, { paidAmountCents: number; paidOrderCount: number }>();
    for (const order of orders) {
      const date = order.updatedAt.toISOString().slice(0, 10);
      const current = buckets.get(date) ?? { paidAmountCents: 0, paidOrderCount: 0 };
      current.paidAmountCents += order.amountCents;
      current.paidOrderCount += 1;
      buckets.set(date, current);
    }

    return {
      range,
      points: [...buckets.entries()].map(([date, value]) => ({
        date,
        paidAmountCents: value.paidAmountCents,
        paidOrderCount: value.paidOrderCount,
      })),
    };
  }

  async getTopPacks(range: AdminDashboardRange, now: Date, limit: number) {
    const rangeStart = resolveRangeStart(range, now);
    const grouped = await this.prisma.order.groupBy({
      by: ['packId'],
      where: { status: 'paid', updatedAt: { gte: rangeStart } },
      _count: { _all: true },
      _sum: { amountCents: true },
      orderBy: { _count: { packId: 'desc' } },
      take: limit,
    });

    const packIds = grouped.map((row) => row.packId);
    const packs = await this.prisma.pack.findMany({
      where: { packId: { in: packIds } },
      select: { packId: true, title: true },
    });
    const titleByPackId = new Map(packs.map((pack) => [pack.packId, pack.title]));

    return {
      range,
      items: grouped.map((row) => ({
        packId: row.packId,
        title: titleByPackId.get(row.packId) ?? row.packId,
        paidOrderCount: row._count._all,
        paidAmountCents: row._sum.amountCents ?? 0,
      })),
    };
  }

  async getAlerts() {
    const paidWithoutAccessRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count
      FROM orders o
      LEFT JOIN pack_access pa ON pa.user_id = o.user_id AND pa.pack_id = o.pack_id
      WHERE o.status = 'paid' AND pa.id IS NULL
    `;
    const paidWithoutAccess = Number(paidWithoutAccessRows[0]?.count ?? 0);

    const pendingRefundCount = await this.prisma.order.count({
      where: { status: 'refunding' },
    });

    const lowCodes = await this.prisma.redemptionCode.count({
      where: {
        status: 'active',
        redeemedCount: { gt: 0 },
      },
    });

    const items = [];
    if (paidWithoutAccess > 0) {
      items.push({
        kind: 'paid_without_access' as const,
        message: '已支付但未发放权益的订单',
        count: paidWithoutAccess,
      });
    }
    if (pendingRefundCount > 0) {
      items.push({
        kind: 'pending_refund' as const,
        message: '退款处理中的订单',
        count: pendingRefundCount,
      });
    }
    if (lowCodes > 0) {
      items.push({
        kind: 'redemption_code_low' as const,
        message: '已有兑换记录的兑换码批次',
        count: lowCodes,
      });
    }

    return { items };
  }
}

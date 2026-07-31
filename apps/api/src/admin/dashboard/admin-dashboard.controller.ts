import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type {
  AdminDashboardAlerts,
  AdminDashboardRevenueSeries,
  AdminDashboardSummary,
  AdminDashboardTopPacks,
} from '@remember/contracts';
import { adminDashboardRangeSchema } from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';

@Controller('admin/dashboard')
@UseGuards(AdminAuthGuard)
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get('summary')
  getSummary(@Query('range') rangeRaw: unknown): Promise<AdminDashboardSummary> {
    const range = adminDashboardRangeSchema.parse(rangeRaw ?? '7d');
    return this.service.getSummary(range);
  }

  @Get('revenue-series')
  getRevenueSeries(@Query('range') rangeRaw: unknown): Promise<AdminDashboardRevenueSeries> {
    const range = adminDashboardRangeSchema.parse(rangeRaw ?? '30d');
    return this.service.getRevenueSeries(range);
  }

  @Get('top-packs')
  getTopPacks(@Query('range') rangeRaw: unknown): Promise<AdminDashboardTopPacks> {
    const range = adminDashboardRangeSchema.parse(rangeRaw ?? '30d');
    return this.service.getTopPacks(range);
  }

  @Get('alerts')
  getAlerts(): Promise<AdminDashboardAlerts> {
    return this.service.getAlerts();
  }
}

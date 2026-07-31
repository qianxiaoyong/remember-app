import { Injectable } from '@nestjs/common';
import type {
  AdminDashboardAlerts,
  AdminDashboardRange,
  AdminDashboardRevenueSeries,
  AdminDashboardSummary,
  AdminDashboardTopPacks,
} from '@remember/contracts';
import {
  adminDashboardAlertsSchema,
  adminDashboardRevenueSeriesSchema,
  adminDashboardSummarySchema,
  adminDashboardTopPacksSchema,
} from '@remember/contracts';
import { AdminDashboardRepository } from './admin-dashboard.repository.js';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly repository: AdminDashboardRepository) {}

  getSummary(range: AdminDashboardRange): Promise<AdminDashboardSummary> {
    return this.repository
      .getSummary(range, new Date())
      .then((value) => adminDashboardSummarySchema.parse(value));
  }

  getRevenueSeries(range: AdminDashboardRange): Promise<AdminDashboardRevenueSeries> {
    return this.repository
      .getRevenueSeries(range, new Date())
      .then((value) => adminDashboardRevenueSeriesSchema.parse(value));
  }

  getTopPacks(range: AdminDashboardRange, limit = 5): Promise<AdminDashboardTopPacks> {
    return this.repository
      .getTopPacks(range, new Date(), limit)
      .then((value) => adminDashboardTopPacksSchema.parse(value));
  }

  getAlerts(): Promise<AdminDashboardAlerts> {
    return this.repository.getAlerts().then((value) => adminDashboardAlertsSchema.parse(value));
  }
}

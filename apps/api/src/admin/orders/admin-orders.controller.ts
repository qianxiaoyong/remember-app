import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import type { AdminOrderDetail, AdminOrderListResponse } from '@remember/contracts';
import { adminListOrdersQuerySchema } from '@remember/contracts';
import { AdminAuthGuard } from '../../admin-auth/admin-auth.guard.js';
import { AdminOrdersService } from './admin-orders.service.js';

@Controller('admin/orders')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly service: AdminOrdersService) {}

  @Get()
  listOrders(@Query() query: unknown): Promise<AdminOrderListResponse> {
    return this.service.listOrders(adminListOrdersQuerySchema.parse(query));
  }

  @Get(':orderId')
  getOrderDetail(@Param('orderId') orderId: string): Promise<AdminOrderDetail> {
    return this.service.getOrderDetail(orderId);
  }
}

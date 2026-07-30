import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { CreateOrderResponse, OrderDetailResponse } from '@remember/contracts';
import { createOrderRequestSchema } from '@remember/contracts';
import { AuthGuard, requireAuthContext, type RequestWithAuth } from '../auth/auth.guard.js';
import { OrderService } from './order.service.js';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(AuthGuard)
  createOrder(@Req() request: RequestWithAuth, @Body() body: unknown): Promise<CreateOrderResponse> {
    const auth = requireAuthContext(request);
    const input = createOrderRequestSchema.parse(body);
    return this.orderService.createOrder(auth.userId, input.packId);
  }

  @Get(':orderId')
  @UseGuards(AuthGuard)
  getOrder(
    @Req() request: RequestWithAuth,
    @Param('orderId') orderId: string,
  ): Promise<OrderDetailResponse> {
    const auth = requireAuthContext(request);
    return this.orderService.getOrder(auth.userId, orderId);
  }
}

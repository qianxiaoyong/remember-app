import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PackAccessModule } from '../pack-access/pack-access.module.js';
import { PaymentModule } from '../payment/payment.module.js';
import { OrderController } from './order.controller.js';
import { OrderRepository } from './order.repository.js';
import { OrderService } from './order.service.js';

@Module({
  imports: [AuthModule, CatalogModule, PackAccessModule, PaymentModule],
  controllers: [OrderController],
  providers: [OrderRepository, OrderService],
  exports: [OrderRepository, OrderService],
})
export class OrderModule {}

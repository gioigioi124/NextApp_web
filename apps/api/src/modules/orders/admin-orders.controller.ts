import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import type { OrderStatus, PaymentStatus } from 'database';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderPaymentDto } from './dto/update-order-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
export class AdminOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(@Query() query: ListOrdersDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status as OrderStatus);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(@Param('id') id: string, @Body() dto: UpdateOrderPaymentDto) {
    return this.ordersService.updatePaymentStatus(id, dto.paymentStatus as PaymentStatus);
  }
}

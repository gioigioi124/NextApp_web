import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(dto);
  }

  @Post('webhook')
  webhook() {
    return this.paymentsService.webhook();
  }
}

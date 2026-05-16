import { Injectable } from '@nestjs/common';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';

@Injectable()
export class PaymentsService {
  createIntent(dto: CreatePaymentIntentDto) {
    return {
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        clientSecret: null,
        provider: 'stripe',
        status: 'not_configured',
      },
      message: 'Stripe is not configured yet',
    };
  }

  webhook() {
    return { received: true };
  }
}

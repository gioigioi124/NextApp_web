import { IsIn } from 'class-validator';

export class UpdateOrderPaymentDto {
  @IsIn(['UNPAID', 'PAID', 'REFUNDED'])
  paymentStatus: string;
}

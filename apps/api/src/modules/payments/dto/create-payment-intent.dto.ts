import { Type } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;
}

import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'])
  status: string;
}

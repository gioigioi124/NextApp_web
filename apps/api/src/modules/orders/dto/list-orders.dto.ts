import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListOrdersDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED'])
  status?: string;

  @IsOptional()
  @IsIn(['UNPAID', 'PAID', 'REFUNDED'])
  paymentStatus?: string;
}

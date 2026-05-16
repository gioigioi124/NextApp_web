import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  addressId: string;

  @IsIn(['COD', 'CARD'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  couponCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

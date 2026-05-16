import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @MaxLength(64)
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['PERCENTAGE', 'FIXED'])
  discountType: 'PERCENTAGE' | 'FIXED';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

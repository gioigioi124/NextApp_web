import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from 'database';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  discountValue: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  minOrderValue?: number;

  @IsNumber()
  @IsOptional()
  minQuantity?: number;

  @IsBoolean()
  @IsOptional()
  appliesToAll?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];
}

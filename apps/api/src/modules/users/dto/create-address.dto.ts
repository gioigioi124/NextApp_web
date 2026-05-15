import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  street: string;

  @IsString()
  ward: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

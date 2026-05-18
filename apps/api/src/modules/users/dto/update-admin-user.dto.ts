import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['CUSTOMER', 'ADMIN', 'STAFF'])
  role?: string;
}

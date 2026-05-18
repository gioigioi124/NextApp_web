import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListUsersDto {
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
  @IsIn(['CUSTOMER', 'ADMIN', 'STAFF'])
  role?: string;
}

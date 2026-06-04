import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { PostStatus, PostType } from 'database';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  seoTitle?: string;

  @IsString()
  @IsOptional()
  seoDescription?: string;
}

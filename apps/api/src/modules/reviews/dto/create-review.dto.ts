import { ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  images?: string[];
}

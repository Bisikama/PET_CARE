import { IsInt, Min, Max, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Rating from 1 to 5',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Review comment',
    example: 'Great service, highly recommended!',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;
}

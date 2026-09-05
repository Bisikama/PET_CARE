import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceSuggestionDto {
  @ApiProperty({
    description: 'Name of the suggested service',
    example: 'Snake Grooming',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serviceName: string;

  @ApiProperty({
    description: 'Description or details of the suggested service',
    example: 'I have a snake and want a groomer for him.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}

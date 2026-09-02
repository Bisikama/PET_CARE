import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum ProviderType {
  SITTER = 'SITTER',
  GROOMER = 'GROOMER',
  VET = 'VET',
}

export class CreateProviderProfileDto {
  @ApiProperty({ enum: ProviderType, example: ProviderType.SITTER })
  @IsEnum(ProviderType)
  providerType: ProviderType;

  @ApiPropertyOptional({ example: 'I love pets' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  experienceYears?: number;
}

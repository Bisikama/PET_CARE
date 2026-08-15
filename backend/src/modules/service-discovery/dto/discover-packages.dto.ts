import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DiscoverPackagesDto {
  @ApiProperty({ description: 'Loại thú cưng (Dog/Cat)', required: false, default: 'Dog' })
  @IsString()
  @IsOptional()
  species?: string;

  @ApiProperty({ description: 'Cân nặng thú cưng (kg)', required: false, default: 5.0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  weight?: number;
}

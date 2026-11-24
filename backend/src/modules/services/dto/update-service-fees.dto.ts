import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class TravelPolicyDto {
  @ApiProperty({ example: 5, description: 'Số km đầu miễn phí' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(100)
  freeKm: number;

  @ApiProperty({ example: 5000, description: 'Phí mỗi km vượt thêm (VND)' })
  @Type(() => Number)
  @IsInt({ message: 'Phí mỗi km phải là số nguyên (VND)' })
  @Min(0)
  @Max(1_000_000)
  perKm: number;
}

export class ServiceSurchargeDto {
  @ApiProperty({ example: 'Lông dài, dày' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'Tên phụ phí không được để trống' })
  @MaxLength(120)
  label: string;

  @ApiProperty({ example: 30000, description: 'Mức thấp nhất (hoặc mức cố định)' })
  @Type(() => Number)
  @IsInt({ message: 'Phụ phí phải là số nguyên (VND)' })
  @Min(0)
  @Max(100_000_000)
  minFee: number;

  @ApiPropertyOptional({
    example: 80000,
    nullable: true,
    description: 'Mức cao nhất; bỏ trống nếu là mức cố định',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Phụ phí phải là số nguyên (VND)' })
  @Min(0)
  @Max(100_000_000)
  maxFee?: number | null;
}

export class UpdateServiceFeesDto {
  @ApiProperty({ type: TravelPolicyDto })
  @ValidateNested()
  @Type(() => TravelPolicyDto)
  travel: TravelPolicyDto;

  @ApiProperty({ type: [ServiceSurchargeDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ServiceSurchargeDto)
  surcharges: ServiceSurchargeDto[];
}

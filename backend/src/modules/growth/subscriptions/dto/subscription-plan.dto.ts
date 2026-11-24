import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PLAN_CODE_PATTERN } from './subscribe.dto';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    example: 'BASIC',
    description:
      'Mã gói, in trong nội dung chuyển khoản. 2-20 ký tự A-Z, 0-9. Không đổi được sau khi tạo.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @Matches(PLAN_CODE_PATTERN, {
    message: 'Mã gói chỉ gồm 2-20 ký tự A-Z, 0-9 (không dấu, không khoảng trắng)',
  })
  code: string;

  @ApiProperty({ example: 'Gói Cơ Bản' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên gói không được để trống' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Dành cho chủ nuôi có 1-2 thú cưng.' })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 99000, description: 'Giá bán (VND)' })
  @Type(() => Number)
  @IsInt({ message: 'Giá phải là số nguyên (VND)' })
  @Min(1000, { message: 'Giá tối thiểu 1.000đ' })
  @Max(100_000_000)
  price: number;

  @ApiProperty({ example: 30, description: 'Thời hạn gói (ngày)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  durationDays: number;

  @ApiPropertyOptional({ type: [String], example: ['Ưu tiên ghép cặp provider'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  benefits?: string[];

  @ApiPropertyOptional({ example: true, description: 'Đang mở bán' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị (nhỏ đứng trước)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  sortOrder?: number;
}

/** Mã gói không sửa được: đã in trong nội dung CK của các đơn cũ. */
export class UpdateSubscriptionPlanDto extends PartialType(
  OmitType(CreateSubscriptionPlanDto, ['code'] as const),
) {}

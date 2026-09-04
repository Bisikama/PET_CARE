import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ description: 'Tên ngân hàng' })
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @ApiProperty({ description: 'Số tài khoản' })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({ description: 'Tên chủ tài khoản' })
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiPropertyOptional({ description: 'Chi nhánh ngân hàng' })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({ description: 'Đặt làm mặc định', default: false })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

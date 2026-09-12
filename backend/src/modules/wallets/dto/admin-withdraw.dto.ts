import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, IsOptional, IsObject } from 'class-validator';

export class AdminWithdrawDto {
  @ApiProperty({ description: 'Số tiền muốn rút (VNĐ)', example: 1000000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Ghi chú rút tiền', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Thông tin tài khoản ngân hàng nhận tiền',
    required: false,
    type: Object,
    example: {
      bank_name: 'Vietcombank',
      account_number: '123456789',
      account_name: 'CONG TY ABC',
      branch: 'Ha Noi'
    }
  })
  @IsObject()
  @IsOptional()
  bankDetails?: any;
}

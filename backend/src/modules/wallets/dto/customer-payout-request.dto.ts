import { IsNumber, Min, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerPayoutRequestDto {
  @ApiProperty({ description: 'Số tiền muốn rút (VNĐ)', minimum: 50000 })
  @IsNumber()
  @Min(50000)
  amount: number;

  @ApiProperty({ 
    description: 'Thông tin tài khoản ngân hàng', 
    example: { bankName: 'Vietcombank', accountNumber: '123456789', accountName: 'NGUYEN VAN A' } 
  })
  @IsObject()
  @IsNotEmpty()
  bankDetails: Record<string, any>;
}

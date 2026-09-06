import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectDeactivationRequestDto {
  @ApiProperty({ description: 'Lý do từ chối yêu cầu hủy tài khoản' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Lý do phải có ít nhất 5 ký tự' })
  @MaxLength(255, { message: 'Lý do không được vượt quá 255 ký tự' })
  reason: string;
}

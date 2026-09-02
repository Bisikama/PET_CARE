import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuspendUserDto {
  @ApiProperty({
    description: 'Lý do khóa tài khoản',
    example: 'Vi phạm điều khoản dịch vụ (Gian lận)',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCapabilityDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động (bật/tắt nhận đơn cho gói này)',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'Chỉ nhận tắm cho các bé đã tiêm phòng dại đầy đủ',
    description: 'Mô tả hoặc lưu ý riêng của đối tác cho dịch vụ này',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  customDescription?: string;
}

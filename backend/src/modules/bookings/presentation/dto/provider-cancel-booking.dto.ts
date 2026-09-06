import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProviderCancelBookingDto {
  @ApiProperty({
    description: 'Lý do đối tác hủy đơn đặt lịch (bắt buộc)',
    example: 'Xe bị hỏng dọc đường không thể di chuyển đến điểm hẹn kịp thời',
  })
  @IsNotEmpty({ message: 'Lý do hủy đơn không được để trống' })
  @IsString({ message: 'Lý do hủy đơn phải là chuỗi ký tự' })
  reason: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm từ đối tác',
    example: 'Đã gọi điện thoại xin lỗi khách hàng',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

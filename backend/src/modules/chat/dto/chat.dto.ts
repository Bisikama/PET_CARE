import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {
  @ApiProperty({ description: 'ID phòng chat', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Dạ, anh tới đón bé lúc mấy giờ ạ?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class MessageReceivedDto {
  @ApiProperty({ description: 'ID tin nhắn', example: 'msg-123' })
  id: string;

  @ApiProperty({ description: 'ID phòng chat', example: 'room-123' })
  roomId: string;

  @ApiProperty({ description: 'ID người gửi', example: 'user-123' })
  senderId: string;

  @ApiProperty({ description: 'Nội dung tin nhắn', example: 'Hello' })
  content: string;

  @ApiProperty({ description: 'Thời gian gửi', example: '2026-09-04T15:00:00Z' })
  createdAt: Date;
}

export class BookingUpdatedDto {
  @ApiProperty({ description: 'ID của Booking', example: 'booking-123' })
  bookingId: string;

  @ApiProperty({ description: 'Trạng thái cũ', example: 'PENDING_PAYMENT' })
  oldStatus: string;

  @ApiProperty({ description: 'Trạng thái mới', example: 'CONFIRMED' })
  newStatus: string;

  @ApiProperty({ description: 'Thời gian cập nhật', example: '2026-09-04T15:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Thông báo', example: 'Thanh toán thành công. Lịch đặt đã được xác nhận.' })
  message: string;
}

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Số trang (mặc định 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Số lượng / trang (mặc định 20)', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

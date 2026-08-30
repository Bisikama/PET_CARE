import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { checklist_item_status, media_type } from '@prisma/client';

export class UpdateBookingChecklistItemDto {
  @ApiProperty({ description: 'ID của checklist item trong đơn booking' })
  @IsNotEmpty()
  @IsString()
  checklistItemId: string;

  @ApiProperty({
    enum: checklist_item_status,
    example: 'DONE',
    description: 'Trạng thái: DONE hoặc SKIPPED',
  })
  @IsEnum(checklist_item_status)
  status: checklist_item_status;

  @ApiPropertyOptional({
    description: 'Ghi chú lý do nếu cần (ví dụ khi bỏ qua hoặc lưu ý đặc biệt)',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BookingEvidenceMediaDto {
  @ApiProperty({ description: 'URL ảnh sau khi làm xong dịch vụ' })
  @IsUrl()
  mediaUrl: string;

  @ApiPropertyOptional({ enum: media_type, default: 'IMAGE' })
  @IsOptional()
  @IsEnum(media_type)
  mediaType?: media_type;

  @ApiPropertyOptional({ description: 'Mô tả ngắn gọn về ảnh minh chứng' })
  @IsOptional()
  @IsString()
  caption?: string;
}

export class CompleteBookingDto {
  @ApiPropertyOptional({
    type: [UpdateBookingChecklistItemDto],
    description: 'Danh sách các mục checklist đã cập nhật (DONE / SKIPPED)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBookingChecklistItemDto)
  checklistItems?: UpdateBookingChecklistItemDto[];

  @ApiPropertyOptional({
    type: [BookingEvidenceMediaDto],
    description: 'Danh sách ảnh chụp minh chứng nghiệm thu sau khi làm',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingEvidenceMediaDto)
  evidenceMedias?: BookingEvidenceMediaDto[];

  @ApiPropertyOptional({ description: 'Ghi chú tổng kết của Groomer gửi cho khách hàng' })
  @IsOptional()
  @IsString()
  providerNote?: string;
}

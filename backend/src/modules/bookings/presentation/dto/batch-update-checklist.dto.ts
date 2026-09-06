import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { checklist_item_status } from '@prisma/client';

export class BatchChecklistItemUpdateDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID của mục checklist cần cập nhật',
  })
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    enum: checklist_item_status,
    example: 'DONE',
    description: 'Trạng thái checklist item: PENDING, DONE, SKIPPED',
  })
  @IsEnum(checklist_item_status)
  status: checklist_item_status;

  @ApiPropertyOptional({
    description: 'Ghi chú lý do thực hiện hoặc bỏ qua mục checklist này',
    example: 'Đã hoàn thành tốt.',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BatchUpdateChecklistDto {
  @ApiProperty({
    type: [BatchChecklistItemUpdateDto],
    description: 'Danh sách các mục checklist cần cập nhật hàng loạt',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchChecklistItemUpdateDto)
  items: BatchChecklistItemUpdateDto[];
}

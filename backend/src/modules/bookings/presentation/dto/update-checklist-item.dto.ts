import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { checklist_item_status } from '@prisma/client';

export class UpdateSingleChecklistItemDto {
  @ApiProperty({
    enum: checklist_item_status,
    example: 'DONE',
    description: 'Trạng thái checklist item: PENDING, DONE, SKIPPED',
  })
  @IsEnum(checklist_item_status)
  status: checklist_item_status;

  @ApiPropertyOptional({
    description: 'Ghi chú lý do thực hiện hoặc bỏ qua mục checklist này',
    example: 'Cún ngoan, tắm sạch và sấy khô hoàn tất.',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

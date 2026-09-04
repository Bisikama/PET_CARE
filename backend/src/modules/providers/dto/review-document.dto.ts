import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { provider_document_status } from '@prisma/client';

export class ReviewDocumentDto {
  @ApiProperty({ enum: provider_document_status, example: provider_document_status.APPROVED })
  @IsEnum(provider_document_status)
  status: provider_document_status;

  @ApiPropertyOptional({ example: 'Hình ảnh bị mờ, vui lòng chụp lại' })
  @IsString()
  @IsOptional()
  rejectReason?: string;
}

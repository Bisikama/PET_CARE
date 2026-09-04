import { ApiProperty } from '@nestjs/swagger';
import { provider_document_status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewKycDto {
  @ApiProperty({ enum: provider_document_status, description: 'Trạng thái duyệt (APPROVED/REJECTED)' })
  @IsEnum(provider_document_status)
  @IsNotEmpty()
  status: provider_document_status;

  @ApiProperty({ required: false, description: 'Lý do từ chối (nếu có)' })
  @IsString()
  @IsOptional()
  rejectReason?: string;
}

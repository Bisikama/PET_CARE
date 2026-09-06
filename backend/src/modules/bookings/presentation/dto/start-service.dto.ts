import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { media_type } from '@prisma/client';

export class StartServiceEvidenceMediaDto {
  @ApiPropertyOptional({
    example: 'https://storage.petcare.com/evidence/checkin-1.jpg',
    description: 'URL ảnh/video hiện trạng ban đầu của thú cưng khi nhận bàn giao',
  })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiPropertyOptional({
    enum: media_type,
    example: 'IMAGE',
    description: 'Loại media (IMAGE hoặc VIDEO)',
    default: 'IMAGE',
  })
  @IsEnum(media_type)
  @IsOptional()
  mediaType?: media_type;

  @ApiPropertyOptional({
    example: 'Ảnh chụp hiện trạng thú cưng trước khi tắm',
    description: 'Chú thích ảnh',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  caption?: string;
}

export class StartServiceDto {
  @ApiPropertyOptional({
    example: 'Bé cún ngoan, có vết xước nhẹ ở tai phải từ trước.',
    description: 'Ghi chú hiện trạng sức khỏe / tâm lý thú cưng ban đầu khi tiếp nhận',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  petConditionNote?: string;

  @ApiPropertyOptional({
    type: [StartServiceEvidenceMediaDto],
    description: 'Danh sách ảnh/video chụp hiện trạng ban đầu của bé trước khi làm dịch vụ',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StartServiceEvidenceMediaDto)
  evidenceMedias?: StartServiceEvidenceMediaDto[];
}

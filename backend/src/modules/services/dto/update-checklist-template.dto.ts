import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChecklistTemplateDto {
  @ApiProperty({ description: 'Tiêu đề đầu việc checklist', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Mô tả chi tiết đầu việc', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Bắt buộc thực hiện hay không', required: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

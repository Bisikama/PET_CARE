import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChecklistTemplateDto {
  @ApiProperty({ description: 'Tiêu đề đầu việc checklist', example: 'Tắm rửa sạch sẽ' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mô tả chi tiết đầu việc',
    required: false,
    example: 'Tắm bằng xà phòng chuyên dụng',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Bắt buộc thực hiện hay không', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Thứ tự sắp xếp', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

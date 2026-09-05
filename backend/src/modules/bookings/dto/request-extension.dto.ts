import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class RequestExtensionDto {
  @ApiProperty({ example: 30, description: 'Số phút muốn xin kéo dài thêm' })
  @IsNumber()
  @Min(15)
  minutes: number;

  @ApiProperty({ example: 'Bé cún hơi quậy nên cần thêm thời gian tắm', description: 'Lý do xin thêm thời gian' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

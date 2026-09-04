import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitKycDto {
  @ApiProperty({ example: '001202012345', description: 'Số CCCD' })
  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Họ và tên trên CCCD' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '1990-01-01', description: 'Ngày sinh (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  dob: string;

  @ApiProperty({ example: '2021-01-01', description: 'Ngày cấp (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh CCCD mặt trước' })
  @IsOptional()
  frontImage: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh CCCD mặt sau' })
  @IsOptional()
  backImage: any;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Ảnh chân dung' })
  @IsOptional()
  faceImage: any;
}

import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { medical_record_type } from '@prisma/client';

export class CreateMedicalRecordDto {
  @ApiProperty({
    description: 'Type of the medical record',
    enum: medical_record_type,
  })
  @IsEnum(medical_record_type)
  @IsNotEmpty()
  recordType: medical_record_type;

  @ApiProperty({
    description: 'Description of the medical record',
    example: 'Rabies vaccine',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Date of the medical record',
    example: '2026-09-04T00:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'Optional attachments (URLs to documents/images)',
    type: [String],
  })
  @IsOptional()
  attachments?: string[];
}

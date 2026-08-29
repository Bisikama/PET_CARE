import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ProviderDocumentType {
  GROOMING_CERTIFICATE = 'GROOMING_CERTIFICATE',
  PET_CARE_CERTIFICATE = 'PET_CARE_CERTIFICATE',
  FIRST_AID_CERTIFICATE = 'FIRST_AID_CERTIFICATE',
  BACKGROUND_SCREENING = 'BACKGROUND_SCREENING',
  OTHER = 'OTHER',
}

export class UploadDocumentDto {
  @ApiProperty({ enum: ProviderDocumentType, example: ProviderDocumentType.GROOMING_CERTIFICATE })
  @IsEnum(ProviderDocumentType)
  @IsNotEmpty()
  documentType: ProviderDocumentType;

  @ApiProperty({ type: 'string', format: 'binary', description: 'File giấy tờ (Ảnh hoặc PDF)' })
  file?: any;
}

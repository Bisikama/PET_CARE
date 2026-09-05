import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckConflictSlotDto {
  @ApiProperty({
    description: 'ID of the provider',
    example: 'd9b9a6b9-b8b3-4f8a-9c71-3a5661b17b94',
  })
  @IsUUID()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({
    description: 'Start time of the slot to check',
    example: '2026-09-04T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'End time of the slot to check',
    example: '2026-09-04T11:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}

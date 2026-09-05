import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { dispute_reason } from '@prisma/client';

export class OpenDisputeDto {
  @ApiProperty({
    description: 'Reason for the dispute',
    enum: dispute_reason,
  })
  @IsEnum(dispute_reason)
  @IsNotEmpty()
  reason: dispute_reason;

  @ApiProperty({
    description: 'Detailed explanation of the dispute',
    example: 'Provider did not show up.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}

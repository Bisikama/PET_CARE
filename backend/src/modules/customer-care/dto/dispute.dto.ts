import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { dispute_decision, dispute_reason } from '@prisma/client';

export class OpenDisputeDto {
  @ApiProperty({ enum: dispute_reason, example: dispute_reason.PROVIDER_NO_SHOW })
  @IsEnum(dispute_reason)
  @IsNotEmpty()
  reason: dispute_reason;

  @ApiProperty({ example: 'Dispute over booking #1234' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Provider never showed up for the grooming session.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  files?: any;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: dispute_decision, example: dispute_decision.FULL_REFUND })
  @IsEnum(dispute_decision)
  @IsNotEmpty()
  decision: dispute_decision;

  @ApiProperty({ example: 'Confirmed provider did not show up based on location logs. Full refund issued.' })
  @IsString()
  @IsNotEmpty()
  resolutionNote: string;

  @ApiPropertyOptional({ description: 'Phần trăm hoàn tiền (nếu PARTIAL_REFUND)', example: 50 })
  @IsOptional()
  refundPercentage?: number;
}

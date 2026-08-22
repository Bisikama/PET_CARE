import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum SubscriptionTier {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export class SubscribeDto {
  @ApiProperty({ enum: SubscriptionTier, example: SubscriptionTier.GOLD })
  @IsEnum(SubscriptionTier)
  @IsNotEmpty()
  tierName: SubscriptionTier;
}

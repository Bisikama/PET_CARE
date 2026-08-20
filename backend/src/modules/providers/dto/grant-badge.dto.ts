import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GrantBadgeDto {
  @ApiProperty({ example: 'VERIFIED_PROVIDER' })
  @IsString()
  @IsNotEmpty()
  badgeCode: string;
}

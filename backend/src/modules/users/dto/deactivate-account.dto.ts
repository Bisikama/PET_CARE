import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeactivateAccountDto {
  @ApiProperty({
    description: 'Reason for account deactivation',
    example: 'I no longer need this service',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

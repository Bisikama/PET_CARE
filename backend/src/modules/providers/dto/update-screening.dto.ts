import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { screening_status } from '@prisma/client';

export class UpdateScreeningDto {
  @ApiProperty({ enum: screening_status, example: screening_status.PASSED })
  @IsEnum(screening_status)
  screeningStatus: screening_status;
}

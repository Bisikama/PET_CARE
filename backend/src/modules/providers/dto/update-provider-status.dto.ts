import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { provider_status } from '@prisma/client';

export class UpdateProviderStatusDto {
  @ApiProperty({
    description: 'Trạng thái hoạt động của đối tác (APPROVED để nhận lịch, PAUSED để tạm ngưng)',
    enum: [provider_status.APPROVED, provider_status.PAUSED],
  })
  @IsEnum([provider_status.APPROVED, provider_status.PAUSED])
  @IsNotEmpty()
  status: typeof provider_status.APPROVED | typeof provider_status.PAUSED;
}

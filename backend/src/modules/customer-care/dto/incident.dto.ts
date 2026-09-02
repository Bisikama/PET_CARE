import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { incident_status, incident_type } from '@prisma/client';

export class ReportIncidentDto {
  @ApiProperty({ enum: incident_type, example: incident_type.PET_HEALTH_EMERGENCY })
  @IsEnum(incident_type)
  @IsNotEmpty()
  type: incident_type;

  @ApiProperty({ example: 'Chó của khách đột ngột lên cơn co giật.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  files?: any;
}

export class ResolveIncidentDto {
  @ApiProperty({ enum: incident_status, example: incident_status.RESOLVED })
  @IsEnum(incident_status)
  @IsNotEmpty()
  status: incident_status;

  @ApiProperty({ example: 'Đã đưa bé đến thú y gần nhất. Khách hàng đã nhận bé an toàn.' })
  @IsString()
  @IsNotEmpty()
  resolutionNote: string;
}

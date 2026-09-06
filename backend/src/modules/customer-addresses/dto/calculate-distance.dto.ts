import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CalculateDistanceDto {
  @ApiPropertyOptional({
    description: 'Vĩ độ điểm xuất phát (Origin Latitude)',
    example: 10.776889,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ điểm xuất phát phải là số' })
  @Min(-90)
  @Max(90)
  originLatitude?: number;

  @ApiPropertyOptional({
    description: 'Kinh độ điểm xuất phát (Origin Longitude)',
    example: 106.700897,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ điểm xuất phát phải là số' })
  @Min(-180)
  @Max(180)
  originLongitude?: number;

  @ApiPropertyOptional({
    description: 'Vĩ độ điểm đến (Destination Latitude)',
    example: 10.792451,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ điểm đến phải là số' })
  @Min(-90)
  @Max(90)
  destinationLatitude?: number;

  @ApiPropertyOptional({
    description: 'Kinh độ điểm đến (Destination Longitude)',
    example: 106.690123,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ điểm đến phải là số' })
  @Min(-180)
  @Max(180)
  destinationLongitude?: number;

  @ApiPropertyOptional({
    description: 'ID địa chỉ của khách hàng (lấy tọa độ tự động từ database)',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsOptional()
  @IsString({ message: 'addressId phải là chuỗi ký tự' })
  addressId?: string;

  @ApiPropertyOptional({
    description: 'ID của đối tác (lấy tọa độ cơ sở base_location và bán kính phục vụ từ database)',
    example: 'a111b222-6c54-4b01-90e6-d701748f0852',
  })
  @IsOptional()
  @IsString({ message: 'providerId phải là chuỗi ký tự' })
  providerId?: string;
}

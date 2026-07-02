import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchProviderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'ID of the pet' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    example: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
    description: 'ID of the service',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    example: '9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e',
    description: 'ID of the customer address',
  })
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({
    example: '2026-07-01',
    description: 'Date to search for availability (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

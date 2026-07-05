import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'ID of the pet' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({
    example: 'f8e7d6c5-b4a3-2f1e-0d9c-8b7a6f5e4d3c',
    description: 'ID of the provider working slot',
  })
  @IsUUID()
  @IsNotEmpty()
  providerWorkingSlotId: string;

  @ApiProperty({
    example: '9a8b7c6d-5e4f-3a2b-1c0d-ef9a8b7c6d5e',
    description: 'ID of the customer address',
  })
  @IsUUID()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({
    example: '5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f',
    description: 'ID of the system service',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({
    example: 'Please handle with care',
    description: 'Optional customer note',
    required: false,
  })
  @IsString()
  @IsOptional()
  customerNote?: string;
}

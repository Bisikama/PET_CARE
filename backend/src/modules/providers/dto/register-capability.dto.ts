import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterCapabilityDto {
  @ApiProperty({ example: 'uuid-of-service' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 'Dog' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  petSpecies: string;

  @ApiProperty({ example: 0 })
  @Transform(({ value }) => (value ? Number(value) : 0))
  @IsNumber()
  @Min(0)
  minWeight: number;

  @ApiProperty({ example: 100 })
  @Transform(({ value }) => (value ? Number(value) : 0))
  @IsNumber()
  @Min(0)
  maxWeight: number;
}

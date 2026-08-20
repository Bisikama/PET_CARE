import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export enum PetSpecies {
  DOG = 'Dog',
  CAT = 'Cat',
}

export class CreatePetDto {
  @ApiProperty({ example: 'Max' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: PetSpecies, example: PetSpecies.DOG })
  @IsEnum(PetSpecies, { message: 'Species must be either Dog or Cat' })
  @IsNotEmpty()
  species: PetSpecies;

  @ApiPropertyOptional({ example: 'Golden Retriever' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  breed?: string;

  @ApiPropertyOptional({ example: 3 })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  age?: number;

  @ApiPropertyOptional({ example: 15.5 })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsPositive()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 'Male' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  gender?: string;

  @ApiPropertyOptional({ description: 'Loại lông, tình trạng sức khoẻ, dị ứng' })
  @IsString()
  @IsOptional()
  healthNote?: string;

  @ApiPropertyOptional({ description: 'Các hành vi đặc biệt' })
  @IsString()
  @IsOptional()
  behaviorNote?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'File ảnh avatar' })
  @IsOptional()
  avatar?: any;
}

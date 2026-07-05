import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class GoogleIdTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIs...' })
  @IsString()
  @MinLength(50)
  idToken: string;

  @ApiPropertyOptional({ example: 'random_nonce_value' })
  @IsOptional()
  @IsString()
  nonce?: string;
}

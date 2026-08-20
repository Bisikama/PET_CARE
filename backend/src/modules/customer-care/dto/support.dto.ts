import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { support_ticket_category } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ enum: support_ticket_category, example: support_ticket_category.ACCOUNT })
  @IsEnum(support_ticket_category)
  @IsNotEmpty()
  category: support_ticket_category;

  @ApiProperty({ example: 'Tôi không thể đổi mật khẩu' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Hệ thống báo lỗi khi tôi thử đổi mật khẩu bằng số điện thoại' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class ReplyTicketDto {
  @ApiProperty({ example: 'Cảm ơn admin, tôi đã làm được' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

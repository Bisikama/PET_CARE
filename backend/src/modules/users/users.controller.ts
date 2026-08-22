import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Users Profile')
@Controller('users')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ cá nhân' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin user đang login' })
  async getMe(@GetCurrentUserId() userId: string) {
    return this.usersService.findPublicById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cơ bản (Tên, SĐT)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async updateProfile(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Cập nhật ảnh đại diện (Avatar)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File ảnh (chỉ chấp nhận jpeg, png, webp. Max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh thành công' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetCurrentUserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn một file ảnh');
    }

    // Validate file type (image only)
    if (!file.mimetype.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh định dạng jpeg, png, jpg, webp');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Kích thước ảnh không được vượt quá 5MB');
    }

    return this.usersService.uploadAvatar(userId, file);
  }
}

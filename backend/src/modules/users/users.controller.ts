import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
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
import { UsersService } from './application/use-cases/users.service';
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
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  async getMe(@GetCurrentUserId() userId: string) {
    return this.usersService.findPublicById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cơ bản (Tên, SĐT)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
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
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc quá lớn' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetCurrentUserId() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: true,
      }),
    ) file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }
}

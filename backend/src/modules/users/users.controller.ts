import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
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
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@ApiTags('Users Profile')
@Controller('users')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ cá nhân' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin user đang login.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin hồ sơ (USER_NOT_FOUND).' })
  async getMe(@GetCurrentUserId() userId: string) {
    return this.usersService.findPublicById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cơ bản (Tên, SĐT)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công, trả về thông tin user mới.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông tin hồ sơ (USER_NOT_FOUND).' })
  async updateProfile(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch('me/notification-settings')
  @ApiOperation({ summary: 'Cập nhật cấu hình thông báo (Email, Push, Marketing)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ.' })
  async updateNotificationSettings(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.usersService.updateNotificationSettings(userId, dto);
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
  @ApiResponse({ status: 200, description: 'Cập nhật ảnh thành công, trả về link ảnh mới.' })
  @ApiResponse({ status: 400, description: 'File không hợp lệ hoặc quá giới hạn dung lượng (Max 5MB).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ.' })
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

  @Delete('me')
  @ApiOperation({ summary: 'Xóa tài khoản vĩnh viễn (Soft Delete)' })
  @ApiResponse({ status: 200, description: 'Xóa tài khoản thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async deleteAccount(@GetCurrentUserId() userId: string) {
    return this.deleteAccountUseCase.execute(userId);
  }
}

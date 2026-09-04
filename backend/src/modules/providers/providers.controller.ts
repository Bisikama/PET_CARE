import { Body, Controller, Post, Get, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException, Delete, Param } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { ProvidersService } from './application/use-cases/providers.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { AddServiceAreaDto } from './dto/add-service-area.dto';
import { RegisterCapabilityDto } from './dto/register-capability.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { UpdateProviderAddressDto } from './dto/update-provider-address.dto';
import { UpdateProviderStatusDto } from './dto/update-provider-status.dto';
import { Patch } from '@nestjs/common';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Tạo hồ sơ đối tác mới' })
  @ApiResponse({ status: 201, description: 'Tạo hồ sơ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  async createProfile(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateProviderProfileDto,
  ) {
    return this.providersService.createProfile(userId, dto);
  }

  @Post('base-address')
  @ApiOperation({ summary: 'Cập nhật địa chỉ cơ sở (Base Location)' })
  @ApiResponse({ status: 200, description: 'Cập nhật địa chỉ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async updateBaseAddress(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateProviderAddressDto,
  ) {
    await this.providersService.updateBaseAddress(userId, dto);
    return { success: true, message: 'Cập nhật địa chỉ thành công' };
  }

  @Post('areas')
  @ApiOperation({ summary: 'Thêm khu vực phục vụ' })
  @ApiResponse({ status: 201, description: 'Thêm khu vực phục vụ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async addServiceArea(
    @GetCurrentUserId() userId: string,
    @Body() dto: AddServiceAreaDto,
  ) {
    await this.providersService.addServiceArea(userId, dto);
    return { success: true, message: 'Thêm khu vực hoạt động thành công' };
  }

  @Post('capabilities')
  @ApiOperation({ summary: 'Đăng ký năng lực dịch vụ mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký năng lực thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async registerCapability(
    @GetCurrentUserId() userId: string,
    @Body() dto: RegisterCapabilityDto,
  ) {
    await this.providersService.registerCapability(userId, dto);
    return { success: true, message: 'Đăng ký dịch vụ thành công' };
  }

  @Post('documents')
  @ApiOperation({ summary: 'Tải lên chứng chỉ nghề nghiệp hoặc bằng cấp bổ sung' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tải tài liệu lên thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ hoặc dung lượng quá lớn (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @GetCurrentUserId() userId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.providersService.uploadDocument(userId, dto, file);
    return { success: true, message: 'Tải tài liệu lên thành công' };
  }

  @Post('kyc')
  @ApiOperation({ summary: 'Tải lên tài liệu eKYC (Mặt trước, mặt sau, chân dung) và thông tin cơ bản' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tải lên tài liệu eKYC thành công.' })
  @ApiResponse({ status: 400, description: 'Thiếu file hoặc thông tin không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontImage', maxCount: 1 },
        { name: 'backImage', maxCount: 1 },
        { name: 'faceImage', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)'), false);
          }
          cb(null, true);
        },
      }
    ),
  )
  async uploadKyc(
    @GetCurrentUserId() userId: string,
    @Body() dto: SubmitKycDto,
    @UploadedFiles() files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
  ) {
    if (!files || !files.frontImage || !files.backImage || !files.faceImage) {
      throw new BadRequestException('Vui lòng cung cấp đủ ảnh Mặt trước, Mặt sau và Ảnh chân dung');
    }

    await this.providersService.uploadKycDocuments(
      userId,
      dto,
      files.frontImage[0],
      files.backImage[0],
      files.faceImage[0],
    );
    return { success: true, message: 'Nộp hồ sơ eKYC thành công' };
  }

  @Get('profile')
  @UseGuards(RolesGuard)
  @Roles(Role.PROVIDER)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ của đối tác' })
  @ApiResponse({ status: 200, description: 'Trả về hồ sơ đối tác.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async getProfile(@GetCurrentUserId() userId: string) {
    return this.providersService.getProfile(userId);
  }

  @Patch('me/status')
  @UseGuards(RolesGuard)
  @Roles(Role.PROVIDER)
  @ApiOperation({ summary: 'Bật/Tắt trạng thái nhận lịch (ACTIVE / PAUSED)' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công.' })
  @ApiResponse({ status: 400, description: 'Trạng thái không hợp lệ hoặc chưa được duyệt KYC.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  async updateStatus(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateProviderStatusDto,
  ) {
    return this.providersService.updateStatus(userId, dto.status);
  }

  @Get('documents')
  @UseGuards(RolesGuard)
  @Roles(Role.PROVIDER)
  @ApiOperation({ summary: 'Lấy danh sách tài liệu của đối tác' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tài liệu của đối tác.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy hồ sơ đối tác (PROVIDER_NOT_FOUND).' })
  async getDocuments(@GetCurrentUserId() userId: string) {
    return this.providersService.getDocuments(userId);
  }

  @Delete('documents/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.PROVIDER)
  @ApiOperation({ summary: 'Xóa một chứng chỉ/tài liệu đã tải lên' })
  @ApiResponse({ status: 200, description: 'Xóa tài liệu thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài liệu (DOCUMENT_NOT_FOUND).' })
  async deleteDocument(
    @GetCurrentUserId() userId: string,
    @Param('id') documentId: string,
  ) {
    await this.providersService.deleteDocument(userId, documentId);
    return { success: true, message: 'Xóa chứng chỉ thành công' };
  }
}

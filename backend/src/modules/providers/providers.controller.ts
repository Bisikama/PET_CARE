import { Body, Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { ProvidersService } from './application/use-cases/providers.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { AddServiceAreaDto } from './dto/add-service-area.dto';
import { RegisterCapabilityDto } from './dto/register-capability.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Tạo hồ sơ đối tác mới' })
  async createProfile(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateProviderProfileDto,
  ) {
    return this.providersService.createProfile(userId, dto);
  }

  @Post('areas')
  @ApiOperation({ summary: 'Thêm khu vực phục vụ' })
  async addServiceArea(
    @GetCurrentUserId() userId: string,
    @Body() dto: AddServiceAreaDto,
  ) {
    return this.providersService.addServiceArea(userId, dto);
  }

  @Post('capabilities')
  @ApiOperation({ summary: 'Đăng ký năng lực dịch vụ mới' })
  async registerCapability(
    @GetCurrentUserId() userId: string,
    @Body() dto: RegisterCapabilityDto,
  ) {
    return this.providersService.registerCapability(userId, dto);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Tải lên tài liệu định danh (KYC) hoặc chứng chỉ' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @GetCurrentUserId() userId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.providersService.uploadDocument(userId, dto, file);
  }

  @Post('kyc')
  @ApiOperation({ summary: 'Tải lên tài liệu eKYC (Mặt trước, mặt sau, chân dung)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'frontImage', maxCount: 1 },
      { name: 'backImage', maxCount: 1 },
      { name: 'faceImage', maxCount: 1 },
    ]),
  )
  async uploadKyc(
    @GetCurrentUserId() userId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    files: {
      frontImage?: Express.Multer.File[];
      backImage?: Express.Multer.File[];
      faceImage?: Express.Multer.File[];
    },
  ) {
    if (!files || !files.frontImage || !files.backImage || !files.faceImage) {
      throw new BadRequestException('Vui lòng cung cấp đủ ảnh Mặt trước, Mặt sau và Ảnh chân dung');
    }

    return this.providersService.uploadKycDocuments(
      userId,
      files.frontImage[0],
      files.backImage[0],
      files.faceImage[0],
    );
  }
}

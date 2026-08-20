import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { ProvidersService } from './application/use-cases/providers.service';
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto';
import { AddServiceAreaDto } from './dto/add-service-area.dto';
import { RegisterCapabilityDto } from './dto/register-capability.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('providers')
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
}

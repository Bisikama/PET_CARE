import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { PetsService } from './application/use-cases/pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới hồ sơ thú cưng' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tạo hồ sơ thú cưng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreatePetDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.petsService.create(userId, dto, file);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thú cưng của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách thú cưng' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  async findAll(@GetCurrentUserId() userId: string) {
    return this.petsService.findAllByCustomer(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thú cưng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Trả về thông tin thú cưng' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng' })
  async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin thú cưng theo ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật thú cưng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng' })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePetDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.petsService.update(id, userId, dto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thú cưng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Xóa thú cưng thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng' })
  async remove(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.delete(id, userId);
  }
}

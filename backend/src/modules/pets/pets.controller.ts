import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { PetsService } from './application/use-cases/pets.service';
import { MedicalRecordsService } from './application/use-cases/medical-records.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@ApiTags('Pets')
@Controller('pets')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới hồ sơ thú cưng' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Tạo hồ sơ thú cưng thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
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
  @ApiResponse({ status: 200, description: 'Trả về danh sách thú cưng.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async findAll(@GetCurrentUserId() userId: string) {
    return this.petsService.findAllByCustomer(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin thú cưng theo ID' })
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Trả về thông tin thú cưng.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng (PET_NOT_FOUND).' })
  async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin thú cưng theo ID' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật thú cưng thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng (PET_NOT_FOUND).' })
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
  @ApiResponse({ status: 200, description: 'Xóa thú cưng thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập thú cưng này (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng (PET_NOT_FOUND).' })
  async remove(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.delete(id, userId);
  }

  // ==========================================
  // MEDICAL RECORDS
  // ==========================================

  @Post(':id/medical-records')
  @ApiOperation({ summary: 'Thêm sổ y tế cho thú cưng' })
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 201, description: 'Thêm sổ y tế thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng (PET_NOT_FOUND).' })
  async createMedicalRecord(
    @GetCurrentUserId() userId: string,
    @Param('id') petId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.create(userId, petId, dto);
  }

  @Get(':id/medical-records')
  @ApiOperation({ summary: 'Lấy danh sách sổ y tế của thú cưng' })
  @ApiParam({ name: 'id', description: 'ID của thú cưng', type: String })
  @ApiResponse({ status: 200, description: 'Trả về danh sách sổ y tế.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thú cưng (PET_NOT_FOUND).' })
  async getMedicalRecords(
    @GetCurrentUserId() userId: string,
    @Param('id') petId: string,
  ) {
    return this.medicalRecordsService.findAllByPet(userId, petId);
  }

  @Delete('medical-records/:recordId')
  @ApiOperation({ summary: 'Xóa sổ y tế' })
  @ApiParam({ name: 'recordId', description: 'ID của sổ y tế', type: String })
  @ApiResponse({ status: 200, description: 'Xóa sổ y tế thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sổ y tế.' })
  async deleteMedicalRecord(
    @GetCurrentUserId() userId: string,
    @Param('recordId') recordId: string,
  ) {
    return this.medicalRecordsService.delete(userId, recordId);
  }

  @Put('medical-records/:recordId')
  @ApiOperation({ summary: 'Cập nhật sổ y tế (PUT /pets/medical-records/:recordId)' })
  @ApiParam({ name: 'recordId', description: 'ID của sổ y tế', type: String })
  @ApiResponse({ status: 200, description: 'Cập nhật sổ y tế thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 403, description: 'Không có quyền (Forbidden).' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sổ y tế.' })
  async updateMedicalRecord(
    @GetCurrentUserId() userId: string,
    @Param('recordId') recordId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(userId, recordId, dto);
  }
}

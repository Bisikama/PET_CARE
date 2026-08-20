import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { PetsService } from './application/use-cases/pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@ApiTags('pets')
@Controller('pets')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Get all pets of current user' })
  async findAll(@GetCurrentUserId() userId: string) {
    return this.petsService.findAllByCustomer(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific pet by id' })
  async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific pet by id' })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Delete a specific pet by id' })
  async remove(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.petsService.delete(id, userId);
  }
}

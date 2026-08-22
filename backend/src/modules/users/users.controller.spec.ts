import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findPublicById: jest.fn(),
            updateProfile: jest.fn(),
            uploadAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return user info from service', async () => {
      const userId = 'user-1';
      const expectedUser = { id: userId, fullName: 'Test User' };
      (usersService.findPublicById as jest.Mock).mockResolvedValue(expectedUser);

      const result = await controller.getMe(userId);

      expect(usersService.findPublicById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('updateProfile', () => {
    it('should call updateProfile on service with correct params', async () => {
      const userId = 'user-1';
      const dto: UpdateProfileDto = { fullName: 'New Name' };
      const expectedResult = { id: userId, ...dto };
      (usersService.updateProfile as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(userId, dto);

      expect(usersService.updateProfile).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadAvatar', () => {
    const mockFile = (mimetype: string, size: number) =>
      ({
        originalname: 'test.jpg',
        mimetype,
        size,
        buffer: Buffer.from('test'),
      }) as Express.Multer.File;

    it('should throw BadRequestException if no file is provided', async () => {
      await expect(controller.uploadAvatar('user-1', null as any)).rejects.toThrow(
        new BadRequestException('Vui lòng chọn một file ảnh'),
      );
    });

    it('should throw BadRequestException if file is not an image', async () => {
      const file = mockFile('application/pdf', 1000);
      await expect(controller.uploadAvatar('user-1', file)).rejects.toThrow(
        new BadRequestException('Chỉ chấp nhận file ảnh định dạng jpeg, png, jpg, webp'),
      );
    });

    it('should throw BadRequestException if file is too large', async () => {
      const file = mockFile('image/jpeg', 6 * 1024 * 1024); // 6MB
      await expect(controller.uploadAvatar('user-1', file)).rejects.toThrow(
        new BadRequestException('Kích thước ảnh không được vượt quá 5MB'),
      );
    });

    it('should call uploadAvatar on service with correct params', async () => {
      const userId = 'user-1';
      const file = mockFile('image/jpeg', 1000);
      const expectedResult = { id: userId, avatarUrl: 'url' };
      (usersService.uploadAvatar as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.uploadAvatar(userId, file);

      expect(usersService.uploadAvatar).toHaveBeenCalledWith(userId, file);
      expect(result).toEqual(expectedResult);
    });
  });
});

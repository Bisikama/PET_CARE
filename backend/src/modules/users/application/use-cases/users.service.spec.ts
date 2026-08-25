import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;
  let storageService: SupabaseStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: SupabaseStorageService,
          useValue: {
            uploadFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
    storageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user-1';
      const dto = { fullName: 'New Name', phone: '0123456789' };
      const expectedUser = { id: userId, ...dto };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
      (prisma.user.update as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.updateProfile(userId, dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: dto,
        select: expect.any(Object),
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'user-1';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateProfile(userId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar and update DB successfully', async () => {
      const userId = 'user-1';
      const file = { originalname: 'avatar.jpg', buffer: Buffer.from('test') } as any;
      const expectedUrl = 'https://storage.com/avatar.jpg';
      const expectedUser = { id: userId, avatarUrl: expectedUrl };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
      (storageService.uploadFile as jest.Mock).mockResolvedValue(expectedUrl);
      (prisma.user.update as jest.Mock).mockResolvedValue(expectedUser);

      const result = await service.uploadAvatar(userId, file);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(storageService.uploadFile).toHaveBeenCalledWith(file, 'avatars', expect.stringContaining('avatar.jpg'));
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { avatarUrl: expectedUrl },
        select: expect.any(Object),
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException if user does not exist when uploading avatar', async () => {
      const userId = 'user-1';
      const file = {} as any;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.uploadAvatar(userId, file)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordUseCase } from './change-password.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-123';
    const dto = {
      oldPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(useCase.execute(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        passwordHash: 'hashedOldPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(useCase.execute(userId, dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and return success message when old password matches', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        passwordHash: 'hashedOldPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mockedSalt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockPrismaService.user.update.mockResolvedValue({ id: userId });

      const result = await useCase.execute(userId, dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(dto.oldPassword, 'hashedOldPassword');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword, 'mockedSalt');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { passwordHash: 'hashedNewPassword' },
      });
      expect(result).toEqual({ success: true, message: 'Đổi mật khẩu thành công' });
    });
  });
});

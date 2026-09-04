import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { BlockProviderSlotUseCase } from './block-provider-slot.use-case';

describe('BlockProviderSlotUseCase', () => {
  let useCase: BlockProviderSlotUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    provider_working_slots: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockProviderSlotUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<BlockProviderSlotUseCase>(BlockProviderSlotUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if slot is not found', async () => {
    mockPrismaService.provider_working_slots.findUnique.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'slot-1')).rejects.toThrow(
      new NotFoundException('Không tìm thấy slot lịch làm việc'),
    );
  });

  it('should throw BadRequestException if user is not the owner of the slot', async () => {
    mockPrismaService.provider_working_slots.findUnique.mockResolvedValue({
      id: 'slot-1',
      provider_working_days: {
        provider_profiles: {
          user_id: 'user-2', // Different user
        },
      },
    });

    await expect(useCase.execute('user-1', 'slot-1')).rejects.toThrow(
      new BadRequestException('Bạn không có quyền thao tác trên slot này'),
    );
  });

  it('should throw BadRequestException if slot is BOOKED', async () => {
    mockPrismaService.provider_working_slots.findUnique.mockResolvedValue({
      id: 'slot-1',
      status: 'BOOKED',
      provider_working_days: {
        provider_profiles: {
          user_id: 'user-1',
        },
      },
    });

    await expect(useCase.execute('user-1', 'slot-1')).rejects.toThrow(
      new BadRequestException('Không thể tạm khóa slot đã được đặt (Bạn cần hủy Booking trước)'),
    );
  });

  it('should return success if slot is already BLOCKED', async () => {
    mockPrismaService.provider_working_slots.findUnique.mockResolvedValue({
      id: 'slot-1',
      status: 'BLOCKED',
      provider_working_days: {
        provider_profiles: {
          user_id: 'user-1',
        },
      },
    });

    const result = await useCase.execute('user-1', 'slot-1');
    expect(result).toEqual({ success: true, message: 'Slot đã bị khóa từ trước' });
    expect(mockPrismaService.provider_working_slots.update).not.toHaveBeenCalled();
  });

  it('should update slot status to BLOCKED if it is AVAILABLE', async () => {
    mockPrismaService.provider_working_slots.findUnique.mockResolvedValue({
      id: 'slot-1',
      status: 'AVAILABLE',
      provider_working_days: {
        provider_profiles: {
          user_id: 'user-1',
        },
      },
    });

    const mockUpdatedSlot = {
      id: 'slot-1',
      status: 'BLOCKED',
    };
    mockPrismaService.provider_working_slots.update.mockResolvedValue(mockUpdatedSlot);

    const result = await useCase.execute('user-1', 'slot-1');
    expect(result).toEqual({
      success: true,
      message: 'Đã tạm khóa slot thành công',
      data: mockUpdatedSlot,
    });
    expect(mockPrismaService.provider_working_slots.update).toHaveBeenCalledWith({
      where: { id: 'slot-1' },
      data: { status: 'BLOCKED' },
    });
  });
});

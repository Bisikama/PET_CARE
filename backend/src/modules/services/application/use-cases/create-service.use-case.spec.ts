import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateServiceUseCase } from './create-service.use-case';
import { SERVICES_REPOSITORY } from '../../services.tokens';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let repository: jest.Mocked<any>;

  beforeEach(async () => {
    repository = {
      createService: jest.fn(),
      findAllServices: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateServiceUseCase, { provide: SERVICES_REPOSITORY, useValue: repository }],
    }).compile();

    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  it('nên tạo dịch vụ mới thành công nếu không trùng tên', async () => {
    repository.findAllServices.mockResolvedValue([]);
    const mockService = { id: 'service-1', name: 'Clean Care', basePrice: 320000 };
    repository.createService.mockResolvedValue(mockService);

    const result = await useCase.execute({
      name: 'Clean Care',
      basePrice: 320000,
      durationMinutes: 120,
    });

    expect(result).toBe(mockService);
    expect(repository.createService).toHaveBeenCalledWith({
      name: 'Clean Care',
      basePrice: 320000,
      durationMinutes: 120,
    });
  });

  it('nên ném lỗi ConflictException nếu trùng tên dịch vụ', async () => {
    repository.findAllServices.mockResolvedValue([{ id: 'service-1', name: 'Clean Care' }]);

    await expect(
      useCase.execute({
        name: 'clean care',
        basePrice: 320000,
        durationMinutes: 120,
      }),
    ).rejects.toThrow(ConflictException);
  });
});

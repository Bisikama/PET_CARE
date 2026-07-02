import { Test, TestingModule } from '@nestjs/testing';
import { CreateAddressUseCase } from './create-address.use-case';
import { CUSTOMER_ADDRESSES_REPOSITORY } from '../../customer-addresses.tokens';

describe('CreateAddressUseCase', () => {
  let useCase: CreateAddressUseCase;
  let repository: jest.Mocked<any>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      unsetOtherDefaults: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAddressUseCase,
        { provide: CUSTOMER_ADDRESSES_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get<CreateAddressUseCase>(CreateAddressUseCase);
  });

  it('nên tạo địa chỉ thành công và gọi unsetOtherDefaults nếu isDefault = true', async () => {
    const mockAddress = { id: 'address-1', customerId: 'customer-1', isDefault: true };
    repository.create.mockResolvedValue(mockAddress);

    const result = await useCase.execute('customer-1', {
      addressLine: '123 Test St',
      isDefault: true,
    });

    expect(result).toBe(mockAddress);
    expect(repository.create).toHaveBeenCalledWith('customer-1', {
      addressLine: '123 Test St',
      isDefault: true,
    });
    expect(repository.unsetOtherDefaults).toHaveBeenCalledWith('customer-1', 'address-1');
  });

  it('không nên gọi unsetOtherDefaults nếu isDefault = false', async () => {
    const mockAddress = { id: 'address-1', customerId: 'customer-1', isDefault: false };
    repository.create.mockResolvedValue(mockAddress);

    const result = await useCase.execute('customer-1', {
      addressLine: '123 Test St',
      isDefault: false,
    });

    expect(result).toBe(mockAddress);
    expect(repository.unsetOtherDefaults).not.toHaveBeenCalled();
  });
});

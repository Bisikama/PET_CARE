import { Test, TestingModule } from '@nestjs/testing';
import { AdminCoreController } from './admin-core.controller';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { Role, user_status } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';

describe('AdminCoreController', () => {
  let controller: AdminCoreController;
  let service: AdminCoreService;

  const mockAdminCoreService = {
    getDashboardStats: jest.fn(),
    getUsers: jest.fn(),
    getUserDetails: jest.fn(),
    suspendUser: jest.fn(),
    reactivateUser: jest.fn(),
    getAuditLogs: jest.fn(),
    getConfigs: jest.fn(),
    updateConfigs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminCoreController],
      providers: [
        {
          provide: AdminCoreService,
          useValue: mockAdminCoreService,
        },
      ],
    }).compile();

    controller = module.get<AdminCoreController>(AdminCoreController);
    service = module.get<AdminCoreService>(AdminCoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return a list of users with meta', async () => {
      const mockResult = {
        data: [{ id: '1', fullName: 'Test User' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockAdminCoreService.getUsers.mockResolvedValue(mockResult);

      const queryDto: GetUsersDto = { page: 1, limit: 10 };
      const result = await controller.getUsers(queryDto);

      expect(service.getUsers).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserDetails', () => {
    it('should return user details by id', async () => {
      const mockResult = { id: '1', fullName: 'Test User' };
      mockAdminCoreService.getUserDetails.mockResolvedValue(mockResult);

      const result = await controller.getUserDetails('1');

      expect(service.getUserDetails).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResult);
    });
  });
});

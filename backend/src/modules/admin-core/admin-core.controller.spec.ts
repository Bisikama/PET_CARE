import { Test, TestingModule } from '@nestjs/testing';
import { AdminCoreController } from './admin-core.controller';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { Role, user_status, deactivation_status } from '@prisma/client';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetDeactivationRequestsDto } from './dto/get-deactivation-requests.dto';
import { RejectDeactivationRequestDto } from './dto/reject-deactivation-request.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';

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
    updateUserRole: jest.fn(),
    getDeactivationRequests: jest.fn(),
    approveDeactivationRequest: jest.fn(),
    rejectDeactivationRequest: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    updateUserAvatar: jest.fn(),
    getUserSessions: jest.fn(),
    revokeUserSessions: jest.fn(),
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

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const dto: UpdateUserRoleDto = { role: Role.ADMIN };
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      mockAdminCoreService.updateUserRole.mockResolvedValue({ message: 'Success' });

      const result = await controller.updateUserRole(req, 'user-id', dto);

      expect(service.updateUserRole).toHaveBeenCalledWith('admin-id', 'user-id', dto);
      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('Deactivation Requests', () => {
    it('should get deactivation requests', async () => {
      const queryDto: GetDeactivationRequestsDto = { page: 1, limit: 10 };
      const mockResult = { data: [], meta: { total: 0 } };
      mockAdminCoreService.getDeactivationRequests.mockResolvedValue(mockResult);

      const result = await controller.getDeactivationRequests(queryDto);

      expect(service.getDeactivationRequests).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockResult);
    });

    it('should approve deactivation request', async () => {
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      mockAdminCoreService.approveDeactivationRequest.mockResolvedValue({ message: 'Success' });

      const result = await controller.approveDeactivationRequest(req, 'request-id');

      expect(service.approveDeactivationRequest).toHaveBeenCalledWith('admin-id', 'request-id');
      expect(result).toEqual({ message: 'Success' });
    });

    it('should reject deactivation request', async () => {
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      const dto: RejectDeactivationRequestDto = { reason: 'No' };
      mockAdminCoreService.rejectDeactivationRequest.mockResolvedValue({ message: 'Success' });

      const result = await controller.rejectDeactivationRequest(req, 'request-id', dto);

      expect(service.rejectDeactivationRequest).toHaveBeenCalledWith('admin-id', 'request-id', dto);
      expect(result).toEqual({ message: 'Success' });
    });
  });

  describe('createUser', () => {
    it('should create user', async () => {
      const dto: CreateUserDto = { email: 'test@example.com', password: 'pass', fullName: 'Test', role: Role.ADMIN };
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      const mockResult = { message: 'Success', data: {} };
      mockAdminCoreService.createUser.mockResolvedValue(mockResult);

      const result = await controller.createUser(req, dto);

      expect(service.createUser).toHaveBeenCalledWith('admin-id', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUser', () => {
    it('should update user info', async () => {
      const dto: UpdateUserDto = { fullName: 'New' };
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      const mockResult = { message: 'Success', data: {} };
      mockAdminCoreService.updateUser.mockResolvedValue(mockResult);

      const result = await controller.updateUser(req, 'user-id', dto);
      expect(service.updateUser).toHaveBeenCalledWith('admin-id', 'user-id', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserAvatar', () => {
    it('should upload and update avatar', async () => {
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      const file = { originalname: 'test.png', size: 1024 } as Express.Multer.File;
      const mockResult = { message: 'Success', avatarUrl: 'http://link' };
      mockAdminCoreService.updateUserAvatar.mockResolvedValue(mockResult);

      const result = await controller.updateUserAvatar(req, 'user-id', file);
      expect(service.updateUserAvatar).toHaveBeenCalledWith('admin-id', 'user-id', file);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Sessions Management', () => {
    it('should get user sessions', async () => {
      mockAdminCoreService.getUserSessions.mockResolvedValue([{ id: 'session-1' }]);
      const result = await controller.getUserSessions('user-id');
      expect(service.getUserSessions).toHaveBeenCalledWith('user-id');
      expect(result).toEqual([{ id: 'session-1' }]);
    });

    it('should revoke user sessions', async () => {
      const req = { user: { sub: 'admin-id' } } as unknown as Request;
      mockAdminCoreService.revokeUserSessions.mockResolvedValue({ message: 'Success' });
      const result = await controller.revokeUserSessions(req, 'user-id');
      expect(service.revokeUserSessions).toHaveBeenCalledWith('admin-id', 'user-id');
      expect(result).toEqual({ message: 'Success' });
    });
  });
});

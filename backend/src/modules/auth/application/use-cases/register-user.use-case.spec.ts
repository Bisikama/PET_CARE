import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { UsersService } from '../../../users/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { Role } from '@prisma/client';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from '../../../../common/constants/success-messages.constant';
import { AUTH_ERRORS } from '../../../../common/constants/error-messages.constant';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let usersService: jest.Mocked<UsersService>;
  let supabaseAuthService: jest.Mocked<SupabaseAuthService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockSupabaseAuthService = {
      normalizeEmail: jest.fn().mockImplementation((email: string) => email.trim().toLowerCase()),
      signUpEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SupabaseAuthService, useValue: mockSupabaseAuthService },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    usersService = module.get(UsersService);
    supabaseAuthService = module.get(SupabaseAuthService);
  });

  it('Register thành công: normalize email, gọi signup, tạo local user, trả response', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: null, identities: [{ id: 'i1' }] } as any,
      session: null,
    });
    usersService.create.mockResolvedValue({ id: 'u1' } as any);

    const result = await useCase.execute({
      email: ' TEST@example.com ',
      password: 'pass',
      fullName: 'Test Name',
    });

    expect(supabaseAuthService.normalizeEmail).toHaveBeenCalledWith(' TEST@example.com ');
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(supabaseAuthService.signUpEmail).toHaveBeenCalledWith('test@example.com', 'pass', 'Test Name');
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        fullName: 'Test Name',
        passwordHash: null,
        supabaseId: 'sb_id',
        role: Role.CUSTOMER,
        isActive: true,
      })
    );
    expect(result).toEqual({
      message: AUTH_MESSAGES.REGISTER_SUCCESS_CHECK_EMAIL,
      requiresEmailConfirmation: true,
    });
  });

  it('Local email đã tồn tại: ném ConflictException', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'existing' } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' })
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));
    
    expect(supabaseAuthService.signUpEmail).not.toHaveBeenCalled();
  });

  it('Supabase obfuscation: trả success, không tạo local user', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [] } as any,
      session: null,
    });

    const result = await useCase.execute({
      email: 'test@example.com',
      password: 'pass',
      fullName: 'Test',
    });

    expect(usersService.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: AUTH_MESSAGES.REGISTER_CHECK_EMAIL,
      requiresEmailConfirmation: true,
    });
  });

  it('Supabase signup lỗi: giữ nguyên exception mapping', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockRejectedValue(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' })
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));
  });

  it('Local profile creation fail: giữ nguyên exception mapping', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [{}] } as any,
      session: null,
    });
    usersService.create.mockRejectedValue(new Error('Prisma error'));

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' })
    ).rejects.toThrow(new InternalServerErrorException(AUTH_ERRORS.LOCAL_PROFILE_CREATE_FAILED));
  });
});

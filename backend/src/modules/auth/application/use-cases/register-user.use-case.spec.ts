import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { UsersService } from '../../../users/application/use-cases/users.service';
import { SupabaseAuthService } from '../../supabase-auth.service';
import { ConflictException } from '@nestjs/common';
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
      update: jest.fn(),
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

  it('Register thành công: normalize email, gọi signup, không tạo local user trước, trả response', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: null, identities: [{ id: 'i1' }] } as any,
      session: null,
    });

    const result = await useCase.execute({
      email: ' TEST@example.com ',
      password: 'pass',
      fullName: 'Test Name',
    });

    expect(supabaseAuthService.normalizeEmail).toHaveBeenCalledWith(' TEST@example.com ');
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(supabaseAuthService.signUpEmail).toHaveBeenCalledWith(
      'test@example.com',
      'pass',
      'Test Name',
    );
    expect(usersService.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: AUTH_MESSAGES.REGISTER_SUCCESS_CHECK_EMAIL,
      requiresEmailConfirmation: true,
    });
  });

  it('Local email đã tồn tại và verified: ném 409 ACCOUNT_ALREADY_EXISTS', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'existing', emailVerifiedAt: new Date() } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' }),
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));

    expect(supabaseAuthService.signUpEmail).not.toHaveBeenCalled();
  });

  it('Local email đã tồn tại nhưng chưa verified: ném 409 EMAIL_CONFIRMATION_PENDING', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'existing', emailVerifiedAt: null } as any);

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' }),
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.EMAIL_CONFIRMATION_PENDING));

    expect(supabaseAuthService.signUpEmail).not.toHaveBeenCalled();
  });

  it('Supabase obfuscation (identities empty): ném 409 ACCOUNT_ALREADY_EXISTS', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [] } as any,
      session: null,
    });

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' }),
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));
  });

  it('Supabase signup lỗi: giữ nguyên exception mapping', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockRejectedValue(
      new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS),
    );

    await expect(
      useCase.execute({ email: 'test@example.com', password: 'pass', fullName: 'Test' }),
    ).rejects.toThrow(new ConflictException(AUTH_ERRORS.ACCOUNT_ALREADY_EXISTS));
  });
});

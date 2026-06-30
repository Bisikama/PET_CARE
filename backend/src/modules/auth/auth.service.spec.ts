import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { Role } from '@prisma/client';
import {
  ConflictException,
  ForbiddenException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let supabaseAuthService: jest.Mocked<SupabaseAuthService>;
  let jwtService: jest.Mocked<JwtService>;
  let prismaService: any;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      findBySupabaseId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findPublicById: jest.fn(),
    };

    const mockSupabaseAuthService = {
      normalizeEmail: jest.fn().mockImplementation((email: string) => email.trim().toLowerCase()),
      signUpEmail: jest.fn(),
      verifySignupOtp: jest.fn(),
      signInEmail: jest.fn(),
      resendSignupOtp: jest.fn(),
      signInGoogleIdToken: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked_token'),
    };

    const mockPrismaService = {
      refresh_tokens: {
        findUnique: jest.fn(),
        delete: jest.fn().mockReturnValue({ catch: jest.fn() }),
        deleteMany: jest.fn().mockReturnValue({ catch: jest.fn() }),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SupabaseAuthService, useValue: mockSupabaseAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue('secret') } },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    supabaseAuthService = module.get(SupabaseAuthService);
    jwtService = module.get(JwtService);
    prismaService = module.get(PrismaService);
  });

  it('AUTH-SB-01: Register normalize email', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 's1', email_confirmed_at: null, identities: [{ id: 'i1' }] } as any,
      session: null,
    });
    usersService.create.mockResolvedValue({ id: 'u1' } as any);

    await service.register({ email: ' TEST@example.com ', password: 'pass', fullName: 'Test' });
    expect(supabaseAuthService.normalizeEmail).toHaveBeenCalledWith(' TEST@example.com ');
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('AUTH-SB-02: Register gọi signUp đúng email/password/full_name', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 's1', identities: [{ id: 'i1' }] } as any,
      session: null,
    });
    usersService.create.mockResolvedValue({ id: 'u1' } as any);

    await service.register({ email: 'test@example.com', password: 'pass', fullName: 'Test Name' });
    expect(supabaseAuthService.signUpEmail).toHaveBeenCalledWith(
      'test@example.com',
      'pass',
      'Test Name',
    );
  });

  it('AUTH-SB-03: Register identity thật tạo local user', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [{ id: 'i1' }] } as any,
      session: null,
    });
    usersService.create.mockResolvedValue({ id: 'u1' } as any);

    await service.register({ email: 'test@example.com', password: 'pass', fullName: 'Test Name' });
    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: null,
        supabaseId: 'sb_id',
        role: Role.CUSTOMER,
        isActive: true,
      }),
    );
  });

  it('AUTH-SB-04: Register obfuscated user không tạo local user', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [] } as any, // obfuscated
      session: null,
    });

    const res = await service.register({
      email: 'test@example.com',
      password: 'pass',
      fullName: 'Test',
    });
    expect(usersService.create).not.toHaveBeenCalled();
    expect(res.requiresEmailConfirmation).toBe(true);
  });

  it('AUTH-SB-05: Supabase signup success nhưng Prisma fail', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    supabaseAuthService.signUpEmail.mockResolvedValue({
      user: { id: 'sb_id', identities: [{}] } as any,
      session: null,
    });
    usersService.create.mockRejectedValue(new Error('Prisma error'));

    await expect(
      service.register({ email: 'test@example.com', password: 'pass', fullName: 'Test' }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('AUTH-SB-06: Verify OTP valid', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({
      user: {
        id: 'sb_id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      } as any,
      session: null,
    });
    usersService.findBySupabaseId.mockResolvedValue(null);
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue({
      id: 'u1',
      isActive: true,
      role: Role.CUSTOMER,
      email: 'test@example.com',
    } as any);

    const res = await service.verifyEmailOtp('test@example.com', '123456');
    expect(res.tokens.accessToken).toBe('mocked_token');
    expect(prismaService.refresh_tokens.create).toHaveBeenCalled();
  });

  it('AUTH-SB-07: Verify OTP invalid/expired', async () => {
    supabaseAuthService.verifySignupOtp.mockResolvedValue({ user: null, session: null });
    await expect(service.verifyEmailOtp('test@example.com', '123456')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('AUTH-SB-08: Login Supabase user success', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: true,
      role: Role.CUSTOMER,
    } as any);
    usersService.update.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: true,
      role: Role.CUSTOMER,
    } as any);
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: new Date().toISOString() } as any,
      session: null,
    });

    const res = await service.login({ email: 'test@example.com', password: 'pass' });
    expect(res.tokens.accessToken).toBe('mocked_token');
  });

  it('AUTH-SB-09: Login Supabase user unverified', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: true,
    } as any);
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: null } as any,
      session: null,
    });

    await expect(service.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('AUTH-SB-10: Login Supabase user inactive', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: false,
    } as any);
    usersService.update.mockResolvedValue({
      id: 'u1',
      supabaseId: 'sb_id',
      isActive: false,
    } as any);
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: { id: 'sb_id', email_confirmed_at: new Date().toISOString() } as any,
      session: null,
    });

    await expect(service.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      'ACCOUNT_LOCKED',
    );
  });

  it('AUTH-SB-11: Legacy bcrypt user', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: null,
      passwordHash: 'hash',
      isActive: true,
      role: Role.CUSTOMER,
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const res = await service.login({ email: 'test@example.com', password: 'pass' });
    expect(supabaseAuthService.signInEmail).not.toHaveBeenCalled();
    expect(res.tokens.accessToken).toBe('mocked_token');
  });

  it('AUTH-SB-12: supabaseId null + passwordHash null', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      supabaseId: null,
      passwordHash: null,
      isActive: true,
    } as any);
    await expect(service.login({ email: 'test@example.com', password: 'pass' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('AUTH-SB-13: Unknown local user nhưng Supabase password login success', async () => {
    usersService.findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // first in login, second in findOrCreate
    usersService.findBySupabaseId.mockResolvedValue(null);
    supabaseAuthService.signInEmail.mockResolvedValue({
      user: {
        id: 'sb_id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      } as any,
      session: null,
    });
    usersService.create.mockResolvedValue({
      id: 'u1',
      isActive: true,
      role: Role.CUSTOMER,
      email: 'test@example.com',
    } as any);

    const res = await service.login({ email: 'test@example.com', password: 'pass' });
    expect(usersService.create).toHaveBeenCalled();
    expect(res.tokens.accessToken).toBe('mocked_token');
  });

  it('AUTH-SB-14: Resend OTP', async () => {
    supabaseAuthService.resendSignupOtp.mockResolvedValue({} as any);
    const res = await service.resendSignupOtp('test@example.com');
    expect(res.message).toBeDefined();
  });

  it('AUTH-SB-15: Google ID token valid', async () => {
    supabaseAuthService.signInGoogleIdToken.mockResolvedValue({
      user: {
        id: 'sb_id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      } as any,
      session: null,
    });
    usersService.findBySupabaseId.mockResolvedValue({
      id: 'u1',
      isActive: true,
      role: Role.CUSTOMER,
      email: 'test@example.com',
    } as any);
    usersService.update.mockResolvedValue({
      id: 'u1',
      isActive: true,
      role: Role.CUSTOMER,
      email: 'test@example.com',
    } as any);

    const res = await service.signInGoogleIdToken('token');
    expect(res.tokens.accessToken).toBe('mocked_token');
  });

  it('AUTH-SB-16: Google ID token invalid', async () => {
    supabaseAuthService.signInGoogleIdToken.mockResolvedValue({ user: {} as any, session: null });
    await expect(service.signInGoogleIdToken('invalid')).rejects.toThrow('GOOGLE_ID_TOKEN_INVALID');
  });

  it('AUTH-SB-18: Refresh inactive user', async () => {
    usersService.findById.mockResolvedValue({ id: 'u1', isActive: false } as any);
    await expect(service.refreshTokens('u1', 'token')).rejects.toThrow('ACCOUNT_LOCKED');
  });
});

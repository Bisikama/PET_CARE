import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRefreshTokenRepository } from './prisma-refresh-token.repository';
import { PrismaService } from '../../../../database/prisma.service';

describe('PrismaRefreshTokenRepository', () => {
  let repository: PrismaRefreshTokenRepository;
  let prisma: {
    refresh_tokens: {
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      refresh_tokens: {
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
        deleteMany: jest.fn().mockResolvedValue(undefined),
        create: jest.fn().mockResolvedValue(undefined),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRefreshTokenRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<PrismaRefreshTokenRepository>(PrismaRefreshTokenRepository);
  });

  describe('findByHash', () => {
    it('calls findUnique with token_hash and returns result', async () => {
      const record = { id: 'r1', user_id: 'u1', token_hash: 'abc', expires_at: new Date() };
      prisma.refresh_tokens.findUnique.mockResolvedValue(record);

      const result = await repository.findByHash('abc');

      expect(prisma.refresh_tokens.findUnique).toHaveBeenCalledWith({
        where: { token_hash: 'abc' },
      });
      expect(result).toEqual(record);
    });

    it('returns null when token not found', async () => {
      prisma.refresh_tokens.findUnique.mockResolvedValue(null);
      const result = await repository.findByHash('missing');
      expect(result).toBeNull();
    });
  });

  describe('deleteByHash', () => {
    it('calls delete with token_hash', async () => {
      await repository.deleteByHash('abc');

      expect(prisma.refresh_tokens.delete).toHaveBeenCalledWith({
        where: { token_hash: 'abc' },
      });
    });

    it('propagates Prisma error (not swallowed)', async () => {
      prisma.refresh_tokens.delete.mockRejectedValue(new Error('Prisma error'));
      await expect(repository.deleteByHash('abc')).rejects.toThrow('Prisma error');
    });
  });

  describe('deleteById', () => {
    it('calls delete with id', async () => {
      await repository.deleteById('r1');

      expect(prisma.refresh_tokens.delete).toHaveBeenCalledWith({
        where: { id: 'r1' },
      });
    });
  });

  describe('deleteAllByUserId', () => {
    it('calls deleteMany with user_id only', async () => {
      await repository.deleteAllByUserId('u1');

      expect(prisma.refresh_tokens.deleteMany).toHaveBeenCalledWith({
        where: { user_id: 'u1' },
      });
    });
  });

  describe('deleteExpiredByUserId', () => {
    it('calls deleteMany with user_id and expires_at lt filter', async () => {
      const before = new Date();
      await repository.deleteExpiredByUserId('u1');
      const after = new Date();

      expect(prisma.refresh_tokens.deleteMany).toHaveBeenCalledTimes(1);
      const callArg = prisma.refresh_tokens.deleteMany.mock.calls[0][0];
      expect(callArg.where.user_id).toBe('u1');
      expect(callArg.where.expires_at.lt).toBeInstanceOf(Date);
      expect(callArg.where.expires_at.lt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(callArg.where.expires_at.lt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('create', () => {
    it('calls create with mapped field names (camelCase → snake_case)', async () => {
      const expiresAt = new Date('2030-01-01');

      await repository.create({
        userId: 'u1',
        tokenHash: 'hash123',
        deviceInfo: 'Chrome/120',
        ipAddress: '127.0.0.1',
        deviceId: 'device-abc',
        expiresAt,
      });

      expect(prisma.refresh_tokens.create).toHaveBeenCalledTimes(1);
      const callData = prisma.refresh_tokens.create.mock.calls[0][0].data;
      expect(callData.user_id).toBe('u1');
      expect(callData.token_hash).toBe('hash123');
      expect(callData.device_info).toBe('Chrome/120');
      expect(callData.ip_address).toBe('127.0.0.1');
      expect(callData.device_id).toBe('device-abc');
      expect(callData.expires_at).toBe(expiresAt);
      expect(callData.last_active_at).toBeInstanceOf(Date);
    });

    it('maps optional fields to undefined when not provided', async () => {
      await repository.create({
        userId: 'u1',
        tokenHash: 'hash456',
        expiresAt: new Date(),
      });

      const callData = prisma.refresh_tokens.create.mock.calls[0][0].data;
      expect(callData.device_info).toBeUndefined();
      expect(callData.ip_address).toBeUndefined();
      expect(callData.device_id).toBeUndefined();
    });
  });
});

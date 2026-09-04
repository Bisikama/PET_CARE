import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { UserCleanupCronService } from './user-cleanup.cron';
import { user_status } from '@prisma/client';

describe('UserCleanupCronService', () => {
  let service: UserCleanupCronService;
  let prismaService: PrismaService;
  let storageService: SupabaseStorageService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  const mockStorageService = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCleanupCronService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<UserCleanupCronService>(UserCleanupCronService);
    prismaService = module.get<PrismaService>(PrismaService);
    storageService = module.get<SupabaseStorageService>(SupabaseStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do nothing if no DELETED users found', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([]);
    await service.handleOrphanedFilesCleanup();
    expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
  });

  it('should extract file path and delete files correctly', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        status: user_status.DELETED,
        avatarUrl: 'https://project.supabase.co/storage/v1/object/public/avatars/user-1-avatar.jpg',
        provider_profiles: {
          identity_card_url: 'https://project.supabase.co/storage/v1/object/public/providers/id.jpg',
          certificate_url: null,
          provider_documents: [
            { file_url: 'https://project.supabase.co/storage/v1/object/public/providers/doc1.pdf' }
          ]
        },
        booking_media: [
          { media_url: 'https://project.supabase.co/storage/v1/object/public/booking-media/media1.jpg' }
        ]
      }
    ]);

    await service.handleOrphanedFilesCleanup();

    // avatar path should be user-1-avatar.jpg
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('avatars', 'user-1-avatar.jpg');
    // identity card path should be id.jpg
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('providers', 'id.jpg');
    // document path should be doc1.pdf
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('providers', 'doc1.pdf');
    // booking media path should be media1.jpg
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('booking-media', 'media1.jpg');
    
    // total 4 deletions
    expect(mockStorageService.deleteFile).toHaveBeenCalledTimes(4);
  });

  it('should not fail the whole process if one deletion throws an error', async () => {
    mockPrismaService.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        status: user_status.DELETED,
        avatarUrl: 'https://project.supabase.co/storage/v1/object/public/avatars/user-1-avatar.jpg',
      },
      {
        id: 'user-2',
        status: user_status.DELETED,
        avatarUrl: 'https://project.supabase.co/storage/v1/object/public/avatars/user-2-avatar.jpg',
      }
    ]);

    // First deletion throws error
    mockStorageService.deleteFile.mockRejectedValueOnce(new Error('S3 Error'));
    // Second deletion succeeds
    mockStorageService.deleteFile.mockResolvedValueOnce(undefined);

    await expect(service.handleOrphanedFilesCleanup()).resolves.not.toThrow();

    expect(mockStorageService.deleteFile).toHaveBeenCalledTimes(2);
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('avatars', 'user-1-avatar.jpg');
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('avatars', 'user-2-avatar.jpg');
  });
});

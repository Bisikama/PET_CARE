import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PROVIDERS_REPOSITORY } from '../../providers.tokens';
import type { IProvidersRepository } from '../ports/providers.repository.port';
import { ProviderProfileRecord } from '../types/providers.types';
import { CreateProviderProfileDto } from '../../dto/create-provider-profile.dto';
import { AddServiceAreaDto } from '../../dto/add-service-area.dto';
import { RegisterCapabilityDto } from '../../dto/register-capability.dto';
import { UploadDocumentDto, ProviderDocumentType } from '../../dto/upload-document.dto';
import { UpdateProviderAddressDto } from '../../dto/update-provider-address.dto';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { SubmitKycDto } from '../../dto/submit-kyc.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @Inject(PROVIDERS_REPOSITORY)
    private readonly providersRepository: IProvidersRepository,
    private readonly storageService: SupabaseStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async createProfile(userId: string, dto: CreateProviderProfileDto): Promise<ProviderProfileRecord> {
    const existing = await this.providersRepository.findProfileByUserId(userId);
    if (existing) {
      throw new ConflictException('Provider profile already exists');
    }
    return this.providersRepository.createProfile(userId, {
      providerType: dto.providerType,
      bio: dto.bio,
      experienceYears: dto.experienceYears,
    });
  }

  async updateBaseAddress(userId: string, dto: UpdateProviderAddressDto): Promise<any> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const updated = await this.prisma.provider_profiles.update({
      where: { id: profile.id },
      data: {
        base_address_line: dto.baseAddressLine,
        base_latitude: dto.baseLatitude,
        base_longitude: dto.baseLongitude,
        base_formatted: dto.baseFormatted,
        service_radius_km: dto.serviceRadiusKm ?? 5,
      },
    });
    return updated;
  }

  async addServiceArea(userId: string, dto: AddServiceAreaDto): Promise<any> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    if (profile.kycStatus !== 'APPROVED') {
      throw new ForbiddenException('You must complete KYC approval before setting up services.');
    }
    return this.providersRepository.addServiceArea(profile.id, dto);
  }

  async registerCapability(userId: string, dto: RegisterCapabilityDto): Promise<any> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    if (profile.kycStatus !== 'APPROVED') {
      throw new ForbiddenException('You must complete KYC approval before setting up services.');
    }

    let basePrice: number | null = null;
    try {
      basePrice = await this.providersRepository.getBasePriceByServiceId(dto.serviceId);
      if (basePrice === null) {
        throw new NotFoundException('Service not found in the system');
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Service not found in the system');
    }

    try {
      return await this.providersRepository.registerService(profile.id, {
        serviceId: dto.serviceId,
        petSpecies: dto.petSpecies,
        minWeight: dto.minWeight,
        maxWeight: dto.maxWeight,
        price: basePrice,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Bạn đã đăng ký năng lực này rồi');
      }
      throw error;
    }
  }

  async uploadDocument(userId: string, dto: UploadDocumentDto, file: Express.Multer.File): Promise<any> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const currentDocuments = await this.prisma.provider_documents.count({
      where: { provider_id: profile.id },
    });
    if (currentDocuments >= 10) {
      throw new BadRequestException('Bạn đã đạt giới hạn 10 chứng chỉ tối đa.');
    }

    const fileName = `${profile.id}/${dto.documentType.toLowerCase()}-${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
    const fileUrl = await this.storageService.uploadFile(file, 'providers', fileName);

    const docData = {
      documentType: dto.documentType,
      fileUrl,
      status: 'PENDING',
    };

    const doc = await this.providersRepository.addDocument(profile.id, docData);

    return doc;
  }

  async uploadKycDocuments(
    userId: string,
    dto: SubmitKycDto,
    frontFile: Express.Multer.File,
    backFile: Express.Multer.File,
    faceFile: Express.Multer.File,
  ) {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    if (profile.kycStatus === 'APPROVED') {
      throw new ConflictException('Hồ sơ KYC của bạn đã được duyệt. Vui lòng liên hệ Admin nếu muốn thay đổi thông tin.');
    }

    // 1. Tải ảnh lên Cloud Storage
    const frontPath = `${profile.id}/kyc-front-${randomUUID()}-${frontFile.originalname}`;
    const backPath = `${profile.id}/kyc-back-${randomUUID()}-${backFile.originalname}`;
    const facePath = `${profile.id}/kyc-face-${randomUUID()}-${faceFile.originalname}`;

    const uploadTasks = [
      this.storageService.uploadFile(frontFile, 'providers', frontPath),
      this.storageService.uploadFile(backFile, 'providers', backPath),
      this.storageService.uploadFile(faceFile, 'providers', facePath),
    ];
    
    const [frontUrl, backUrl, faceUrl] = await Promise.all(uploadTasks);

    // 2. Mặc định là PENDING để chờ Admin duyệt
    const newKycStatus = 'PENDING';
    const documentStatus = 'PENDING';

    try {
      // 3. Thực thi Database Transaction
      return await this.prisma.$transaction(async (tx) => {
      // 3.1. Cập nhật Provider Profile
      const updatedProfile = await tx.provider_profiles.update({
        where: { user_id: userId },
        data: {
          kyc_status: newKycStatus,
          identity_card_url: frontUrl, 
          id_number: dto.idNumber,
          full_name_on_id: dto.fullName,
          dob: new Date(dto.dob),
          issue_date: new Date(dto.issueDate),
          // Bỏ trống kyc_provider và face_match_score do không dùng bên thứ 3
          kyc_provider: null,
          face_match_score: null,
        },
      });

      // 3.2. Lưu chứng từ vào bảng provider_documents
      const documentsToCreate = [
        {
          provider_id: updatedProfile.id,
          document_type: 'IDENTITY_CARD' as const,
          file_url: frontUrl,
          status: documentStatus as 'PENDING',
          note: 'Ảnh CCCD Mặt trước',
        },
        {
          provider_id: updatedProfile.id,
          document_type: 'IDENTITY_CARD' as const,
          file_url: backUrl,
          status: documentStatus as 'PENDING',
          note: 'Ảnh CCCD Mặt sau',
        },
        {
          provider_id: updatedProfile.id,
          document_type: 'FACE_PORTRAIT' as const,
          file_url: faceUrl,
          status: documentStatus as 'PENDING',
          note: 'Ảnh chân dung Face Match',
        },
      ];

      await tx.provider_documents.createMany({
        data: documentsToCreate,
      });

      await tx.audit_logs.create({
        data: {
          action: 'SUBMIT_MANUAL_KYC',
          target_type: 'PROVIDER_PROFILE',
          target_id: updatedProfile.id,
          reason: 'User submitted KYC documents for manual review',
          new_value: { kyc_status: 'PENDING' },
        },
      });

      return updatedProfile;
      });
    } catch (error) {
      // Nếu transaction lỗi, dọn dẹp rác trên Cloud Storage
      await Promise.allSettled([
        this.storageService.deleteFile('providers', frontPath),
        this.storageService.deleteFile('providers', backPath),
        this.storageService.deleteFile('providers', facePath),
      ]);
      throw error;
    }
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
      include: {
        provider_services: true,
        provider_service_areas: true,
      }
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
      return profile;
  }

  async updateStatus(userId: string, status: 'APPROVED' | 'PAUSED') {
    const profile = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });
    
    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    }

    if (profile.kyc_status !== 'APPROVED') {
      throw new BadRequestException('Chỉ có thể thay đổi trạng thái khi hồ sơ đã được duyệt');
    }

    const updated = await this.prisma.provider_profiles.update({
      where: { id: profile.id },
      data: { status: status as any },
    });
    
    return { success: true, message: `Đã chuyển trạng thái thành ${status}`, data: updated };
  }

  async getDocuments(userId: string) {
    const profile = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    
    return this.prisma.provider_documents.findMany({
      where: { provider_id: profile.id },
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const document = await this.prisma.provider_documents.findUnique({
      where: { id: documentId },
    });

    if (!document || document.provider_id !== profile.id) {
      throw new NotFoundException('Document not found or access denied');
    }

    // Xóa trên Supabase Storage
    try {
      const pathPart = document.file_url.split('/public/providers/')[1];
      if (pathPart) {
        await this.storageService.deleteFile('providers', pathPart);
      }
    } catch (e) {
      // Bỏ qua lỗi xóa file nếu file không tồn tại trên Cloud
    }

    // Xóa mềm trong DB
    await this.providersRepository.deleteDocument(documentId);
  }

  async getReviews(userId: string) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.prisma.reviews.findMany({
      where: { reviewee_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        bookings: {
          select: { id: true, status: true },
        },
      }
    });
  }

  async getTrustScoreLogs(userId: string) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return this.prisma.audit_logs.findMany({
      where: { 
        target_id: provider.id,
        target_type: 'PROVIDER_PROFILE',
        action: 'RESOLVE_DISPUTE'
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getProviderDashboard(userId: string) {
    const provider = await this.providersRepository.findProfileByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Provider profile not found');
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Total revenue this month (Completed bookings)
    const completedBookingsThisMonth = await this.prisma.bookings.findMany({
      where: {
        provider_id: provider.id,
        status: 'COMPLETED',
        completed_at: {
          gte: firstDayOfMonth,
        },
      },
    });

    const totalRevenueThisMonth = completedBookingsThisMonth.reduce((acc, curr) => {
      return acc + Number(curr.total_price);
    }, 0);

    const totalCompleted = await this.prisma.bookings.count({
      where: { provider_id: provider.id, status: 'COMPLETED' },
    });

    const totalCancelled = await this.prisma.bookings.count({
      where: { provider_id: provider.id, status: 'CANCELLED' },
    });

    return {
      totalRevenueThisMonth,
      totalCompletedBookings: totalCompleted,
      totalCancelledBookings: totalCancelled,
    };
  }
}

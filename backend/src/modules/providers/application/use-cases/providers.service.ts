import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDERS_REPOSITORY } from '../../providers.tokens';
import type { IProvidersRepository } from '../ports/providers.repository.port';
import { ProviderProfileRecord } from '../types/providers.types';
import { CreateProviderProfileDto } from '../../dto/create-provider-profile.dto';
import { AddServiceAreaDto } from '../../dto/add-service-area.dto';
import { RegisterCapabilityDto } from '../../dto/register-capability.dto';
import { UploadDocumentDto, ProviderDocumentType } from '../../dto/upload-document.dto';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { EkycService } from '../../ekyc.service';

@Injectable()
export class ProvidersService {
  constructor(
    @Inject(PROVIDERS_REPOSITORY)
    private readonly providersRepository: IProvidersRepository,
    private readonly storageService: SupabaseStorageService,
    private readonly prisma: PrismaService,
    private readonly ekycService: EkycService,
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

  async addServiceArea(userId: string, dto: AddServiceAreaDto): Promise<void> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    await this.providersRepository.addServiceArea(profile.id, dto);
  }

  async registerCapability(userId: string, dto: RegisterCapabilityDto): Promise<void> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const basePrice = await this.providersRepository.getBasePriceByServiceId(dto.serviceId);
    if (basePrice === null) {
      throw new NotFoundException('Service not found');
    }

    try {
      await this.providersRepository.registerService(profile.id, {
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

  async uploadDocument(userId: string, dto: UploadDocumentDto, file: Express.Multer.File): Promise<void> {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileName = `${profile.id}/${dto.documentType.toLowerCase()}-${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
    const fileUrl = await this.storageService.uploadFile(file, 'providers', fileName);

    await this.providersRepository.addDocument(profile.id, {
      documentType: dto.documentType,
      fileUrl,
    });

    if (dto.documentType === ProviderDocumentType.IDENTITY_CARD) {
      await this.providersRepository.updateIdentityCardUrl(profile.id, fileUrl);
    }
  }

  async uploadKycDocuments(
    userId: string,
    frontFile: Express.Multer.File,
    backFile: Express.Multer.File,
    faceFile: Express.Multer.File,
  ) {
    const profile = await this.providersRepository.findProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    // 1. Gọi hệ thống eKYC (Real 3rd-party) xử lý trực tiếp trên RAM (Buffer)
    const ekycResult = await this.ekycService.verifyIdentity(
      frontFile.buffer,
      backFile.buffer,
      faceFile.buffer,
    );

    // 2. Tải ảnh lên Cloud Storage CHỈ KHI eKYC thành công (Tránh rác)
    const frontPath = `${profile.id}/kyc-front-${randomUUID()}-${frontFile.originalname}`;
    const backPath = `${profile.id}/kyc-back-${randomUUID()}-${backFile.originalname}`;
    const facePath = `${profile.id}/kyc-face-${randomUUID()}-${faceFile.originalname}`;

    const uploadTasks = [
      this.storageService.uploadFile(frontFile, 'providers', frontPath),
      this.storageService.uploadFile(backFile, 'providers', backPath),
      this.storageService.uploadFile(faceFile, 'providers', facePath),
    ];
    
    const [frontUrl, backUrl, faceUrl] = await Promise.all(uploadTasks);

    // 3. Logic Auto-Approve (Threshold = 90%)
    const isApproved = ekycResult.faceMatchScore >= 90;
    const newKycStatus = isApproved ? 'APPROVED' : 'PENDING';
    const documentStatus = isApproved ? 'APPROVED' : 'PENDING';

    try {
      // 4. Thực thi Database Transaction để đảm bảo tính toàn vẹn 100%
      return await this.prisma.$transaction(async (tx) => {
      // 4.1. Cập nhật Provider Profile
      const updatedProfile = await tx.provider_profiles.update({
        where: { user_id: userId },
        data: {
          kyc_status: newKycStatus,
          identity_card_url: frontUrl, 
          id_number: ekycResult.idNumber,
          full_name_on_id: ekycResult.fullName,
          dob: ekycResult.dob,
          issue_date: ekycResult.issueDate,
          face_match_score: ekycResult.faceMatchScore,
          kyc_provider: ekycResult.provider,
        },
      });

      // 4.2. Lưu chứng từ vào bảng provider_documents
      const documentsToCreate = [
        {
          provider_id: updatedProfile.id,
          document_type: 'IDENTITY_CARD' as const,
          file_url: frontUrl,
          status: documentStatus as 'APPROVED' | 'PENDING',
          note: 'Ảnh CCCD Mặt trước',
        },
        {
          provider_id: updatedProfile.id,
          document_type: 'IDENTITY_CARD' as const,
          file_url: backUrl,
          status: documentStatus as 'APPROVED' | 'PENDING',
          note: 'Ảnh CCCD Mặt sau',
        },
        {
          provider_id: updatedProfile.id,
          document_type: 'OTHER' as const, // Sử dụng OTHER tạm thời cho ảnh chân dung
          file_url: faceUrl,
          status: documentStatus as 'APPROVED' | 'PENDING',
          note: 'Ảnh chân dung Face Match',
        },
      ];

      await tx.provider_documents.createMany({
        data: documentsToCreate,
      });

      // 4.3. Nếu Auto-Approve, BẮT BUỘC ghi Audit Log
      if (isApproved) {
        await tx.audit_logs.create({
          data: {
            action: 'AUTO_APPROVE_KYC',
            target_type: 'PROVIDER_PROFILE',
            target_id: updatedProfile.id,
            reason: `eKYC FaceMatchScore: ${ekycResult.faceMatchScore}%`,
            new_value: { kyc_status: 'APPROVED', provider: ekycResult.provider },
          },
        });
      }

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
}

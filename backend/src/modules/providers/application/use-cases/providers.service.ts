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

@Injectable()
export class ProvidersService {
  constructor(
    @Inject(PROVIDERS_REPOSITORY)
    private readonly providersRepository: IProvidersRepository,
    private readonly storageService: SupabaseStorageService,
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
}

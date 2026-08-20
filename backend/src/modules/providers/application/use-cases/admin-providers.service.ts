import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { Prisma, provider_document_status, screening_status, provider_status, Role } from '@prisma/client';
import { ReviewDocumentDto } from '../../dto/review-document.dto';
import { UpdateScreeningDto } from '../../dto/update-screening.dto';
import { GrantBadgeDto } from '../../dto/grant-badge.dto';

@Injectable()
export class AdminProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async reviewDocument(adminId: string, documentId: string, dto: ReviewDocumentDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const document = await tx.provider_documents.findUnique({
        where: { id: documentId },
      });
      
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      await tx.provider_documents.update({
        where: { id: documentId },
        data: {
          status: dto.status,
          reject_reason: dto.rejectReason,
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'REVIEW_DOCUMENT',
          target_type: 'provider_documents',
          target_id: documentId,
          old_value: { status: document.status } as Prisma.JsonObject,
          new_value: { status: dto.status, reject_reason: dto.rejectReason } as Prisma.JsonObject,
        },
      });

      const allDocs = await tx.provider_documents.findMany({
        where: { provider_id: document.provider_id },
      });
      
      const allApproved = allDocs.every(d => 
        (d.id === documentId ? dto.status : d.status) === provider_document_status.APPROVED
      );

      if (allApproved) {
        await tx.provider_profiles.update({
          where: { id: document.provider_id },
          data: { kyc_status: provider_document_status.APPROVED },
        });
        
        await this.evaluateAndGrantBadges(tx, document.provider_id);
      }
    });
  }

  async updateScreeningStatus(adminId: string, providerId: string, dto: UpdateScreeningDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const profile = await tx.provider_profiles.findUnique({
        where: { id: providerId },
      });
      
      if (!profile) {
        throw new NotFoundException('Provider profile not found');
      }

      await tx.provider_profiles.update({
        where: { id: providerId },
        data: { screening_status: dto.screeningStatus },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'UPDATE_SCREENING',
          target_type: 'provider_profiles',
          target_id: providerId,
          old_value: { screening_status: profile.screening_status } as Prisma.JsonObject,
          new_value: { screening_status: dto.screeningStatus } as Prisma.JsonObject,
        },
      });

      if (dto.screeningStatus === screening_status.PASSED) {
        await this.evaluateAndGrantBadges(tx, providerId);
      }
    });
  }

  async approveProvider(adminId: string, providerId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const profile = await tx.provider_profiles.findUnique({
        where: { id: providerId },
      });
      
      if (!profile) {
        throw new NotFoundException('Provider profile not found');
      }

      await tx.provider_profiles.update({
        where: { id: providerId },
        data: { status: provider_status.APPROVED },
      });

      await tx.user.update({
        where: { id: profile.user_id },
        data: { role: Role.PROVIDER },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'APPROVE_PROVIDER',
          target_type: 'provider_profiles',
          target_id: providerId,
          old_value: { status: profile.status } as Prisma.JsonObject,
          new_value: { status: provider_status.APPROVED } as Prisma.JsonObject,
        },
      });
    });
  }

  async grantBadge(adminId: string, providerId: string, dto: GrantBadgeDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const badge = await tx.trust_badges.findUnique({
        where: { code: dto.badgeCode },
      });

      if (!badge) {
        throw new NotFoundException(`Badge ${dto.badgeCode} not found`);
      }

      const existingBadge = await tx.provider_trust_badges.findUnique({
        where: { provider_id_badge_id: { provider_id: providerId, badge_id: badge.id } },
      });

      if (existingBadge) {
        throw new BadRequestException('Provider already has this badge');
      }

      await tx.provider_trust_badges.create({
        data: {
          provider_id: providerId,
          badge_id: badge.id,
          granted_by: adminId,
        },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'GRANT_BADGE',
          target_type: 'provider_trust_badges',
          target_id: providerId,
          old_value: Prisma.DbNull,
          new_value: { badge: badge.code } as Prisma.JsonObject,
        },
      });
    });
  }

  private async evaluateAndGrantBadges(tx: Prisma.TransactionClient, providerId: string): Promise<void> {
    const profile = await tx.provider_profiles.findUnique({
      where: { id: providerId },
    });

    if (!profile) return;

    if (profile.kyc_status === provider_document_status.APPROVED && profile.screening_status === screening_status.PASSED) {
      const verifiedBadge = await tx.trust_badges.findUnique({
        where: { code: 'VERIFIED_PROVIDER' },
      });

      if (verifiedBadge) {
        const existingBadge = await tx.provider_trust_badges.findUnique({
          where: { provider_id_badge_id: { provider_id: providerId, badge_id: verifiedBadge.id } },
        });

        if (!existingBadge) {
          await tx.provider_trust_badges.create({
            data: {
              provider_id: providerId,
              badge_id: verifiedBadge.id,
              granted_by: null, // System auto-granted
              reason: 'Auto-granted for passing KYC and Screening',
            },
          });
          
          await tx.audit_logs.create({
            data: {
              actor_id: null,
              action: 'AUTO_GRANT_BADGE',
              target_type: 'provider_trust_badges',
              target_id: providerId,
              old_value: Prisma.DbNull,
              new_value: { badge: 'VERIFIED_PROVIDER' } as Prisma.JsonObject,
            },
          });
        }
      }
    }
  }
}

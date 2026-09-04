import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { user_status } from '@prisma/client';

@Injectable()
export class UserCleanupCronService {
  private readonly logger = new Logger(UserCleanupCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Run every Sunday at 3:00 AM
   * Cleans up Supabase files for users whose status is DELETED.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleOrphanedFilesCleanup() {
    this.logger.log('Starting orphaned files cleanup for DELETED users...');

    try {
      // Find all users marked as DELETED
      const deletedUsers = await this.prisma.user.findMany({
        where: { status: user_status.DELETED },
        include: {
          provider_profiles: {
            include: {
              provider_documents: true,
            },
          },
          booking_media: true,
        },
      });

      if (deletedUsers.length === 0) {
        this.logger.log('No DELETED users found for cleanup.');
        return;
      }

      for (const user of deletedUsers) {
        try {
          // 1. Delete Avatar
          if (user.avatarUrl) {
            const avatarPath = this.extractFilePath(user.avatarUrl);
            if (avatarPath) {
              await this.storageService.deleteFile('avatars', avatarPath);
              this.logger.debug(`Deleted avatar for user ${user.id}`);
            }
          }
          // 2. Delete Provider Documents (if any)
          if (user.provider_profiles) {
            let docPaths: string[] = [];

            if (user.provider_profiles.identity_card_url) {
              docPaths.push(user.provider_profiles.identity_card_url);
            }
            if (user.provider_profiles.certificate_url) {
              docPaths.push(user.provider_profiles.certificate_url);
            }

            if (user.provider_profiles.provider_documents && user.provider_profiles.provider_documents.length > 0) {
              for (const doc of user.provider_profiles.provider_documents) {
                if (doc.file_url) {
                  docPaths.push(doc.file_url);
                }
              }
            }

            for (const docUrl of docPaths) {
              const path = this.extractFilePath(docUrl);
              if (path) {
                await this.storageService.deleteFile('providers', path);
              }
            }
            this.logger.debug(`Deleted provider documents for user ${user.id}`);
          }

          // 3. Delete Booking Media
          if (user.booking_media && user.booking_media.length > 0) {
            for (const media of user.booking_media) {
              const path = this.extractFilePath(media.media_url);
              if (path) {
                await this.storageService.deleteFile('booking-media', path); // Assuming bucket is 'booking-media'
              }
            }
            this.logger.debug(`Deleted ${user.booking_media.length} booking media items for user ${user.id}`);
          }

          // We can fully delete the user from DB now if required by policy, 
          // or just leave them as DELETED but without media files.
        } catch (error) {
          this.logger.error(`Error cleaning up files for user ${user.id}:`, error);
          // Continue with next user even if one fails
        }
      }

      this.logger.log('Completed orphaned files cleanup.');
    } catch (error) {
      this.logger.error('Failed to run orphaned files cleanup job', error);
    }
  }

  /**
   * Helper function to extract file path from full Supabase public URL
   */
  private extractFilePath(fullUrl: string): string | null {
    try {
      // Supabase public URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path/to/file.ext]
      const parts = fullUrl.split('/public/');
      if (parts.length < 2) return null;
      
      const bucketAndPath = parts[1].split('/');
      // Remove bucket (first item) and join the rest as path
      bucketAndPath.shift();
      return bucketAndPath.join('/');
    } catch (error) {
      return null;
    }
  }
}

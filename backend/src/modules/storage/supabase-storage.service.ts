import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import ws from 'ws';

@Injectable()
export class SupabaseStorageService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseStorageService.name);

  private readonly verifiedBuckets = new Set<string>();

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
        },
        realtime: {
          transport: ws as any,
        },
      },
    );
  }

  async ensureBucketExists(bucket: string): Promise<void> {
    if (this.verifiedBuckets.has(bucket)) {
      return;
    }
    try {
      const { data: bucketData, error: getError } = await this.supabase.storage.getBucket(bucket);
      if (!bucketData || getError) {
        const { error: createError } = await this.supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
        });
        if (createError && !createError.message?.toLowerCase().includes('already exists')) {
          this.logger.warn(`Could not create bucket '${bucket}': ${createError.message}`);
        } else {
          this.logger.log(`Ensured/Created Supabase storage bucket: '${bucket}'`);
        }
      }
      this.verifiedBuckets.add(bucket);
    } catch (err) {
      this.logger.warn(`Error ensuring bucket '${bucket}': ${(err as Error).message}`);
    }
  }

  async uploadFile(file: Express.Multer.File, bucket: string, path: string): Promise<string> {
    try {
      await this.ensureBucketExists(bucket);

      let { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        // If error is related to missing bucket, retry creating bucket and uploading
        if (
          error.message?.toLowerCase().includes('not found') ||
          error.message?.toLowerCase().includes('bucket')
        ) {
          this.verifiedBuckets.delete(bucket);
          await this.ensureBucketExists(bucket);
          const retry = await this.supabase.storage
            .from(bucket)
            .upload(path, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });
          data = retry.data;
          error = retry.error;
        }
      }

      if (error || !data) {
        const errorMsg = error?.message || 'No upload response data returned';
        this.logger.error(`Error uploading file to Supabase (${bucket}): ${errorMsg}`, error?.stack);
        throw new InternalServerErrorException(`Could not upload file to storage: ${errorMsg}`);
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      this.logger.error(
        `Unexpected error uploading file to bucket '${bucket}': ${(err as Error).message}`,
        (err as Error).stack,
      );
      if (err instanceof InternalServerErrorException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Unexpected error uploading file: ${(err as Error).message}`,
      );
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.error(`Error deleting file from Supabase: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not delete file from storage');
    }
  }

  extractPathFromUrl(url: string, bucket: string): string | null {
    if (!url) return null;
    const bucketUrlPart = `/object/public/${bucket}/`;
    const index = url.indexOf(bucketUrlPart);
    if (index !== -1) {
      return url.substring(index + bucketUrlPart.length);
    }
    return null;
  }
}

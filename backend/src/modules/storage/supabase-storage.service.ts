import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import ws from 'ws';

@Injectable()
export class SupabaseStorageService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(SupabaseStorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY'),
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

  async uploadFile(file: Express.Multer.File, bucket: string, path: string): Promise<string> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        this.logger.error(`Error uploading file to Supabase: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Could not upload file to storage');
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      this.logger.error(`Unexpected error uploading file: ${(err as Error).message}`, (err as Error).stack);
      throw new InternalServerErrorException('Unexpected error uploading file');
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.error(`Error deleting file from Supabase: ${error.message}`, error.stack);
    }
  }
}

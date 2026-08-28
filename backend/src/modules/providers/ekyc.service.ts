import { Injectable, Logger, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import sharp = require('sharp');
import FormData = require('form-data');
import { firstValueFrom } from 'rxjs';

export interface EkycResult {
  idNumber: string;
  fullName: string;
  dob: Date;
  issueDate: Date;
  faceMatchScore: number;
  provider: string;
}

@Injectable()
export class EkycService {
  private readonly logger = new Logger(EkycService.name);
  private readonly apiKey = process.env.FPT_AI_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Tối ưu hóa ảnh (Nén 80%, resize chiều rộng tối đa 1024px)
   */
  private async optimizeImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      this.logger.error('Lỗi khi nén ảnh với Sharp', error.stack);
      throw new BadGatewayException('Không thể xử lý định dạng ảnh KYC.');
    }
  }

  async verifyIdentity(frontBuffer: Buffer, backBuffer: Buffer, faceBuffer: Buffer): Promise<EkycResult> {
    if (!this.apiKey) {
      this.logger.error('Thiếu cấu hình FPT_AI_API_KEY trong file .env');
      throw new BadGatewayException('Hệ thống eKYC đang gián đoạn, vui lòng thử lại sau');
    }

    try {
      this.logger.log('Bắt đầu tối ưu ảnh KYC...');
      const [optFront, optFace] = await Promise.all([
        this.optimizeImage(frontBuffer),
        this.optimizeImage(faceBuffer),
      ]);

      // 1. Gọi API Nhận diện CCCD (OCR)
      this.logger.log('Đang gọi API OCR của FPT.AI...');
      const ocrFormData = new FormData();
      ocrFormData.append('image', optFront, { filename: 'front.jpg', contentType: 'image/jpeg' });
      // Thêm backBuffer nếu API FPT yêu cầu cả mặt sau

      const ocrResponse = await firstValueFrom(
        this.httpService.post('https://api.fpt.ai/vision/idr/vnm', ocrFormData, {
          headers: {
            'api-key': this.apiKey,
            ...ocrFormData.getHeaders(),
          },
          timeout: 15000,
        })
      );

      const ocrData = ocrResponse.data?.data?.[0];
      if (!ocrData) {
        throw new Error('Dữ liệu OCR trả về không hợp lệ');
      }

      // 2. Gọi API So sánh Khuôn mặt (Face Match)
      this.logger.log('Đang gọi API Face Match của FPT.AI...');
      const faceFormData = new FormData();
      faceFormData.append('image1', optFront, { filename: 'front.jpg', contentType: 'image/jpeg' });
      faceFormData.append('image2', optFace, { filename: 'face.jpg', contentType: 'image/jpeg' });

      const faceResponse = await firstValueFrom(
        this.httpService.post('https://api.fpt.ai/dmp/checkface/v1', faceFormData, {
          headers: {
            'api-key': this.apiKey,
            ...faceFormData.getHeaders(),
          },
          timeout: 15000,
        })
      );

      const faceData = faceResponse.data;
      if (!faceData || faceData.code !== '200') {
        throw new Error('Dữ liệu Face Match trả về không hợp lệ');
      }

      const matchScore = parseFloat(faceData.data?.similarity || '0');

      this.logger.log(`eKYC thành công - Tỷ lệ khớp khuôn mặt: ${matchScore}%`);

      // 3. Chuẩn hóa & trả về kết quả
      return {
        idNumber: ocrData.id || '',
        fullName: ocrData.name || '',
        dob: this.parseDate(ocrData.dob),
        issueDate: this.parseDate(ocrData.issue_date),
        faceMatchScore: matchScore,
        provider: 'FPT.AI',
      };
    } catch (error) {
      this.logger.error('Lỗi khi giao tiếp với hệ thống eKYC FPT.AI', error.response?.data || error.message, error.stack);
      throw new BadGatewayException('Hệ thống eKYC đang gián đoạn, vui lòng thử lại sau');
    }
  }

  /**
   * Hàm hỗ trợ parse chuỗi ngày tháng dạng DD/MM/YYYY từ FPT OCR sang Date
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return new Date();
  }
}

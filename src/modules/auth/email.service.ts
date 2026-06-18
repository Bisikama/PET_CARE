import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import { buildEmailVerificationTemplate } from './email-template';

const OTP_BACKGROUND_CID = 'petcare-otp-background';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendEmailVerificationOtp(email: string, otp: string) {
    const transporter = this.createTransporter();
    const mailUser = this.configService.get<string>('MAIL_USER');
    const from =
      this.configService.get<string>('MAIL_FROM') ||
      (mailUser ? `Pet Care <${mailUser}>` : 'Pet Care <no-reply@pet-care.local>');
    const appName = this.configService.get<string>('APP_NAME') || 'Pet Care';
    const ttlMinutes = this.getOtpTtlMinutes();

    if (!transporter) {
      if (this.configService.get<string>('NODE_ENV') === 'production') {
        throw new InternalServerErrorException('Chưa cấu hình SMTP để gửi email OTP');
      }

      this.logger.warn(`SMTP chưa cấu hình. OTP xác thực email cho ${email}: ${otp}`);
      return;
    }

    const backgroundPath = this.resolveBackgroundPath();

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Xác thực mã OTP',
      text: `Mã OTP xác thực email của bạn là ${otp}. Mã có hiệu lực trong ${ttlMinutes} phút.`,
      html: buildEmailVerificationTemplate({
        appName,
        otp,
        ttlMinutes,
        backgroundCid: OTP_BACKGROUND_CID,
      }),
      attachments: [
        {
          filename: 'pet-care-otp-background.png',
          path: backgroundPath,
          cid: OTP_BACKGROUND_CID,
          contentDisposition: 'inline',
        },
      ],
    });

    this.logger.log(`Đã gửi email OTP đến ${email}`);
  }

  getOtpTtlMinutes() {
    return Number(this.configService.get<string>('EMAIL_OTP_TTL_MINUTES') || 10);
  }

  private createTransporter(): Transporter | null {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT') || 587);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');
    const secure = this.configService.get<string>('MAIL_SECURE') === 'true';

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  private resolveBackgroundPath() {
    const configuredPath = this.configService.get<string>('MAIL_OTP_BACKGROUND_PATH');
    const candidates = [
      configuredPath,
      join(process.cwd(), 'dist', 'assets', 'email', 'pet-care-otp-background.png'),
      join(process.cwd(), 'src', 'assets', 'email', 'pet-care-otp-background.png'),
    ].filter((path): path is string => Boolean(path));

    const backgroundPath = candidates.find((path) => existsSync(path));

    if (!backgroundPath) {
      throw new InternalServerErrorException('Không tìm thấy ảnh nền email OTP');
    }

    return backgroundPath;
  }
}

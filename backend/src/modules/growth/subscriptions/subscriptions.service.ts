import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WalletsService } from '../../wallets/application/use-cases/wallets.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscribeDto } from './dto/subscribe.dto';
import { subscription_status } from '@prisma/client';
import * as crypto from 'crypto';
import * as qs from 'qs';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly walletsService: WalletsService,
  ) {}

  private readonly TIER_PRICES = {
    'SILVER': 100000,
    'GOLD': 300000,
    'PLATINUM': 500000,
  };

  async checkoutVnpay(userId: string, dto: SubscribeDto, ipAddress: string) {
    const activeSub = await this.prisma.subscriptions.findFirst({
      where: {
        user_id: userId,
        status: subscription_status.ACTIVE,
        end_date: { gt: new Date() },
      },
    });

    if (activeSub) {
      throw new ConflictException('Bạn đã có gói đăng ký đang hoạt động');
    }

    const amount = this.TIER_PRICES[dto.tierName as string as keyof typeof this.TIER_PRICES] || 100000;

    const tmnCode = this.configService.get<string>('VNP_TMN_CODE', 'DUMMY_TMN_CODE');
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET', 'DUMMY_SECRET');
    const vnpUrl = this.configService.get<string>('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    const returnUrl = this.configService.get<string>('VNP_RETURN_URL', 'http://localhost:3000/api/payments/vnpay-return');

    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = 'SUB' + date.getTime().toString();
    const orderInfo = `SUB_${userId}_${dto.tierName}`;

    const vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    return { paymentUrl: vnpUrl + '?' + qs.stringify(sortedParams, { encode: false }) };
  }

  async checkoutWallet(userId: string, dto: SubscribeDto) {
    return this.prisma.$transaction(async (tx) => {
      const activeSub = await tx.subscriptions.findFirst({
        where: {
          user_id: userId,
          status: subscription_status.ACTIVE,
          end_date: { gt: new Date() },
        },
      });

      if (activeSub) {
        throw new ConflictException('Bạn đã có gói đăng ký đang hoạt động');
      }

      const amount = this.TIER_PRICES[dto.tierName as string as keyof typeof this.TIER_PRICES] || 100000;

      const wallet = await tx.wallets.findUnique({ where: { user_id: userId } });
      if (!wallet) throw new BadRequestException('Không tìm thấy ví');
      
      if (wallet.balance.lessThan(amount)) {
        throw new ConflictException('Số dư ví không đủ để thanh toán gói này');
      }

      // Trừ tiền
      await this.walletsService.processTransaction(
        wallet.id,
        amount,
        'DEBIT',
        null,
        `Thanh toán gói Subscription ${dto.tierName}`,
        tx,
      );

      // Tạo gói ACTIVE
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const subscription = await tx.subscriptions.create({
        data: {
          user_id: userId,
          tier_name: dto.tierName,
          start_date: startDate,
          end_date: endDate,
          status: subscription_status.ACTIVE,
        },
      });

      return {
        success: true,
        message: 'Đăng ký gói thành công',
        subscription,
      };
    });
  }

  // Được gọi từ PaymentsService khi nhận IPN VNPay thành công
  async handleSubscriptionSuccess(userId: string, tierName: string) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    await this.prisma.subscriptions.create({
      data: {
        user_id: userId,
        tier_name: tierName,
        start_date: startDate,
        end_date: endDate,
        status: subscription_status.ACTIVE,
      },
    });
    this.logger.log(`Kích hoạt thành công gói ${tierName} cho user ${userId} qua VNPay IPN`);
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }

  private sortObject(obj: any): any {
    const sorted: Record<string, string> = {};
    const str: string[] = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscriptions.findFirst({
      where: {
        user_id: userId,
        status: subscription_status.ACTIVE,
      },
      orderBy: {
        end_date: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('Không tìm thấy gói đăng ký nào');
    }

    return subscription;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('Bắt đầu quét các gói Subscription đã hết hạn...');
    const now = new Date();
    
    const { count } = await this.prisma.subscriptions.updateMany({
      where: {
        status: subscription_status.ACTIVE,
        end_date: { lt: now },
      },
      data: {
        status: subscription_status.EXPIRED,
      },
    });

    this.logger.log(`Đã cập nhật trạng thái EXPIRED cho ${count} gói.`);
  }
}

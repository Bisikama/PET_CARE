import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  /**
   * Tạo URL thanh toán qua VNPay
   */
  async createVNPayUrl(
    bookingId: string,
    amount: number,
    ipAddress: string,
    promotionCode?: string,
  ): Promise<string> {
    let finalAmount = amount;

    if (promotionCode) {
      const promotion = await this.prisma.promotions.findUnique({
        where: { code: promotionCode },
      });

      if (!promotion) throw new BadRequestException('Mã khuyến mãi không tồn tại');
      if (!promotion.is_active) throw new BadRequestException('Mã khuyến mãi đã ngừng hoạt động');

      const now = new Date();
      if (promotion.start_date > now || promotion.end_date < now) {
         throw new BadRequestException('Mã khuyến mãi đã hết hạn hoặc chưa đến ngày áp dụng');
      }

      if (promotion.min_order_value && amount < Number(promotion.min_order_value)) {
         throw new BadRequestException(`Đơn hàng phải tối thiểu ${promotion.min_order_value} để áp dụng mã`);
      }

      if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
         throw new BadRequestException('Mã khuyến mãi đã hết lượt sử dụng');
      }

      let discountAmount = 0;
      if (promotion.discount_percent) {
        discountAmount = amount * (promotion.discount_percent / 100);
      } else if (promotion.discount_amount) {
        discountAmount = Number(promotion.discount_amount);
      }

      if (promotion.max_discount_amount && discountAmount > Number(promotion.max_discount_amount)) {
        discountAmount = Number(promotion.max_discount_amount);
      }

      finalAmount = amount - discountAmount;
      if (finalAmount < 0) finalAmount = 0;
    }

    const tmnCode = this.configService.get<string>('VNP_TMN_CODE', 'DUMMY_TMN_CODE');
    const secretKey = this.configService.get<string>('VNP_HASH_SECRET', 'DUMMY_SECRET');
    const vnpUrl = this.configService.get<string>(
      'VNP_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    const returnUrl = this.configService.get<string>(
      'VNP_RETURN_URL',
      'http://localhost:3000/api/payments/vnpay-return',
    );

    const date = new Date();
    const createDate = this.formatDate(date);
    const orderId = bookingId.replace(/-/g, '').substring(0, 15); // orderId VNPay giới hạn 15-50 ký tự

    const vnp_Params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan booking ${bookingId}${promotionCode ? ` promo ${promotionCode}` : ''}`,
      vnp_OrderType: 'other',
      vnp_Amount: Math.round(finalAmount) * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sắp xếp params theo thứ tự alphabet
    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sortedParams['vnp_SecureHash'] = signed;

    const paymentUrl = vnpUrl + '?' + qs.stringify(sortedParams, { encode: false });

    // Lưu lại thông tin thanh toán dạng PENDING
    await this.prisma.payments.create({
      data: {
        booking_id: bookingId,
        customer_id: await this.getCustomerIdFromBooking(bookingId),
        amount: finalAmount,
        method: 'VNPAY',
        status: 'PENDING',
        transaction_code: orderId,
      },
    });

    return paymentUrl;
  }

  /**
   * Xử lý IPN Webhook từ VNPay gửi về
   */
  async processPaymentCallback(vnp_Params: any): Promise<{ RspCode: string; Message: string }> {
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const secretKey = this.configService.get<string>('VNP_HASH_SECRET', 'DUMMY_SECRET');
    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Bắt buộc verify chữ ký điện tử
    if (secureHash !== signed) {
      this.logger.error('VNPay IPN: Lỗi xác thực chữ ký (Checksum failed)');
      return { RspCode: '97', Message: 'Checksum failed' };
    }

    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const idempotencyKey = vnp_Params['vnp_TransactionNo']; // Mã giao dịch của VNPay

    // Bọc trong Transaction để xử lý nghiệp vụ thanh toán & ví (Idempotency)
    try {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payments.findFirst({
          where: { transaction_code: orderId },
          include: { bookings: true },
        });

        if (!payment) {
          throw new BadRequestException('Không tìm thấy giao dịch');
        }

        if (payment.status !== 'PENDING') {
          // Idempotency: Giao dịch đã được xử lý rồi
          return { RspCode: '02', Message: 'Order already confirmed' };
        }

        // Kiểm tra Idempotency Key 
        if (payment.idempotency_key === idempotencyKey) {
           return { RspCode: '02', Message: 'Idempotent request detected' };
        }

        if (rspCode === '00') {
          // Thanh toán THÀNH CÔNG
          // 1. Cập nhật trạng thái Payment sang Ký Quỹ
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'PAID_HELD_IN_ESCROW',
              paid_at: new Date(),
              idempotency_key: idempotencyKey,
            },
          });

          // 2. Chuyển trạng thái Booking sang Chờ Provider xác nhận
          await tx.bookings.update({
            where: { id: payment.booking_id },
            data: { status: 'PENDING_PROVIDER_ACCEPTANCE' },
          });

          // 3. Tiền vào ví Provider ở dạng Ký quỹ (Pending Balance)
          const providerId = payment.bookings?.provider_id;
          if (providerId) {
            const providerWallet = await tx.wallets.findUnique({
              where: { user_id: providerId }
            });
            
            if (providerWallet) {
              await this.walletsService.processTransaction(
                providerWallet.id,
                Number(payment.bookings.total_price), // Đảm bảo ghi nhận giá trị gốc
                'ESCROW_HOLD',
                payment.booking_id,
                'Ký quỹ thanh toán từ VNPay',
                tx,
              );
            }
          }

          // 4. Xử lý lưu promotion usage nếu có
          const orderInfo = vnp_Params['vnp_OrderInfo'] as string;
          if (orderInfo && orderInfo.includes('promo ')) {
            const promoMatch = orderInfo.match(/promo (\w+)/);
            if (promoMatch && promoMatch[1]) {
              const promoCode = promoMatch[1];
              const promotion = await tx.promotions.findUnique({ where: { code: promoCode } });
              if (promotion) {
                // Tăng used_count
                await tx.promotions.update({
                  where: { id: promotion.id },
                  data: { used_count: { increment: 1 } }
                });
                // Lưu usage
                await tx.promotion_usages.create({
                  data: {
                    promotion_id: promotion.id,
                    user_id: payment.customer_id,
                    booking_id: payment.booking_id,
                  }
                });
              }
            }
          }
        } else {
          // Thanh toán THẤT BẠI
          await tx.payments.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              idempotency_key: idempotencyKey,
            },
          });
        }
      });

      return { RspCode: '00', Message: 'Confirm Success' };
    } catch (error) {
      this.logger.error(`VNPay IPN Error: ${error.message}`);
      if (error.message === 'Không tìm thấy giao dịch') {
        return { RspCode: '01', Message: 'Order not found' };
      }
      return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  async getBookingForCheckout(bookingId: string) {
    const booking = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }
    return booking;
  }

  private async getCustomerIdFromBooking(bookingId: string): Promise<string> {
    const booking = await this.prisma.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) throw new BadRequestException('Booking not found');
    return booking.customer_id;
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
}

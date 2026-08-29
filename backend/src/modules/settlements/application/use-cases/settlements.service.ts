import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';

@Injectable()
export class SettlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletsService: WalletsService,
  ) {}

  /**
   * Lấy danh sách các yêu cầu rút tiền đang chờ duyệt
   */
  async getPendingPayoutRequests() {
    return this.prisma.payout_requests.findMany({
      where: { status: 'PAYOUT_PENDING' },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Giải ngân tiền cho Provider (Flow 14)
   * Duyệt yêu cầu rút tiền
   */
  async approvePayoutRequest(adminId: string, payoutRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lấy thông tin yêu cầu rút tiền
      const payoutRequest = await tx.payout_requests.findUnique({
        where: { id: payoutRequestId },
      });

      if (!payoutRequest) {
        throw new BadRequestException('Không tìm thấy yêu cầu rút tiền');
      }

      if (payoutRequest.status !== 'PAYOUT_PENDING') {
        throw new ConflictException('Yêu cầu rút tiền không ở trạng thái chờ duyệt');
      }

      // 2. Lấy thông tin ví
      const wallet = await tx.wallets.findUnique({
        where: { user_id: payoutRequest.provider_id },
      });

      if (!wallet) {
        throw new BadRequestException('Không tìm thấy ví của Provider');
      }

      // 3. Kiểm soát rủi ro: Số dư phải đủ
      if (wallet.balance.lessThan(payoutRequest.amount)) {
        throw new ConflictException('Số dư khả dụng không đủ để giải ngân');
      }

      // 4. Trừ tiền (DEBIT / PAYOUT)
      await this.walletsService.processTransaction(
        wallet.id,
        payoutRequest.amount,
        'PAYOUT',
        null, // Payout không gắn với 1 booking cụ thể
        `Duyệt rút tiền cho yêu cầu ${payoutRequestId}`,
        tx,
      );

      // 5. Đổi trạng thái Payout Request
      const updatedRequest = await tx.payout_requests.update({
        where: { id: payoutRequestId },
        data: {
          status: 'PAID_OUT',
          admin_note: `Processed by Admin ${adminId}`,
        },
      });

      // 6. Ghi log kiểm toán
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'APPROVE_PAYOUT',
          target_type: 'PAYOUT_REQUEST',
          target_id: payoutRequestId,
          old_value: { status: 'PAYOUT_PENDING' },
          new_value: { status: 'PAID_OUT' },
          reason: 'Duyệt yêu cầu rút tiền',
        },
      });

      return updatedRequest;
    });
  }

  /**
   * Hàm Nội Bộ: Giải phóng tiền ký quỹ cho Provider (Flow 13)
   * Có thể gọi từ Booking Flow khi hoàn thành dịch vụ, hoặc từ Admin thủ công.
   */
  async releaseEscrow(bookingId: string, tx: Prisma.TransactionClient) {
    // 1. Fetch booking and payment
    const booking = await tx.bookings.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      throw new BadRequestException('Không tìm thấy Booking');
    }

    const payment = booking.payments;
    if (!payment) {
      throw new BadRequestException('Không tìm thấy thông tin thanh toán cho Booking này');
    }

    // 2. Kiểm tra trạng thái Payment
    if (payment.status !== 'PAID_HELD_IN_ESCROW' && payment.status !== 'ESCROW_ON_HOLD') {
      throw new ConflictException('Thanh toán không ở trạng thái ký quỹ (Escrow Hold)');
    }

    if (!booking.provider_id) {
      throw new BadRequestException('Booking chưa được gán Provider, không thể giải phóng ký quỹ');
    }

    // 3. Lấy ví của Provider
    const providerWallet = await tx.wallets.findUnique({
      where: { user_id: booking.provider_id },
    });

    if (!providerWallet) {
      throw new BadRequestException('Không tìm thấy ví của Provider');
    }

    // 4. Giải phóng ký quỹ (ESCROW_RELEASE: Giảm pending_balance, Tăng balance)
    await this.walletsService.processTransaction(
      providerWallet.id,
      Number(booking.total_price), // Đảm bảo release theo giá trị gốc
      'ESCROW_RELEASE',
      bookingId,
      `Giải phóng tiền ký quỹ cho Booking ${bookingId}`,
      tx,
    );

    // 5. Cập nhật trạng thái Payment
    const updatedPayment = await tx.payments.update({
      where: { id: payment.id },
      data: { status: 'RELEASED_TO_PROVIDER', released_at: new Date() },
    });

    return updatedPayment;
  }

  /**
   * Admin: Giải phóng tiền ký quỹ thủ công
   */
  async manualReleaseEscrow(adminId: string, bookingId: string, reason: string) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Bắt buộc phải nhập lý do giải phóng thủ công');
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await this.releaseEscrow(bookingId, tx);

      // Ghi log kiểm toán
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'MANUAL_ESCROW_RELEASE',
          target_type: 'PAYMENT',
          target_id: payment.id,
          old_value: { status: 'PAID_HELD_IN_ESCROW' },
          new_value: { status: 'RELEASED_TO_PROVIDER' },
          reason: reason,
        },
      });

      return { success: true, message: 'Đã giải phóng tiền ký quỹ thành công', payment };
    });
  }

  /**
   * Admin: Hoàn tiền thủ công cho Customer (Flow 15)
   */
  async manualRefund(adminId: string, bookingId: string, reason: string) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('Bắt buộc phải nhập lý do hoàn tiền');
    }

    return this.prisma.$transaction(async (tx) => {
      // 2. Kiểm soát rủi ro sinh tử cho manual refund
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
        include: { payments: true },
      });
      if (!booking || !booking.payments) throw new BadRequestException('Không tìm thấy Booking hoặc Thanh toán');
      
      const payment = booking.payments;
      if (booking.status === 'DISPUTED' || payment.status === 'ESCROW_ON_HOLD') {
        throw new ConflictException('Không thể hoàn tiền Booking đang tranh chấp. Cần giải quyết tranh chấp trước.');
      }
      
      const updatedPayment = await this.refund(bookingId, tx, `Hoàn tiền thủ công: ${reason}`);

      // 5. Ghi log kiểm toán
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'MANUAL_REFUND',
          target_type: 'PAYMENT',
          target_id: payment.id,
          old_value: { paymentStatus: payment.status, bookingStatus: booking.status },
          new_value: { paymentStatus: 'REFUNDED', bookingStatus: 'CANCELLED' },
          reason: reason,
        },
      });

      return { success: true, message: 'Hoàn tiền thành công', payment: updatedPayment };
    });
  }

  /**
   * Internal logic: Refund payment
   */
  async refund(bookingId: string, tx: Prisma.TransactionClient, reason: string) {
    const booking = await tx.bookings.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) throw new BadRequestException('Không tìm thấy Booking');
    const payment = booking.payments;
    if (!payment) throw new BadRequestException('Không tìm thấy thông tin thanh toán');

    if (payment.status === 'RELEASED_TO_PROVIDER') {
      throw new ConflictException('Không thể hoàn tiền. Tiền đã được giải phóng cho Provider.');
    }
    if (payment.status === 'REFUNDED') {
      throw new ConflictException('Giao dịch thanh toán đã được hoàn tiền từ trước.');
    }
    if (payment.status !== 'PAID_HELD_IN_ESCROW' && payment.status !== 'ESCROW_ON_HOLD') {
       throw new ConflictException('Thanh toán phải ở trạng thái ký quỹ mới có thể hoàn tiền.');
    }

    // 1. Revert Provider Escrow -> Balance -> Debit
    if (booking.provider_id) {
      const providerWallet = await tx.wallets.findUnique({ where: { user_id: booking.provider_id } });
      if (providerWallet) {
        // Giải phóng ký quỹ ảo
        await this.walletsService.processTransaction(
          providerWallet.id,
          Number(booking.total_price),
          'ESCROW_RELEASE',
          bookingId,
          `Hoàn tiền (Hủy ký quỹ) Booking ${bookingId}`,
          tx,
        );
        // Trừ lại số dư
        await this.walletsService.processTransaction(
          providerWallet.id,
          Number(booking.total_price),
          'DEBIT',
          bookingId,
          `Hoàn tiền (Trừ số dư) Booking ${bookingId}`,
          tx,
        );
      }
    }

    // 2. Refund to Customer Wallet (amount actually paid)
    const customerWallet = await tx.wallets.findUnique({
      where: { user_id: booking.customer_id },
    });
    if (customerWallet) {
      await this.walletsService.processTransaction(
        customerWallet.id,
        payment.amount,
        'CREDIT',
        bookingId,
        reason,
        tx,
      );
    }

    // 3. Update DB statuses
    const updatedPayment = await tx.payments.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED', refunded_at: new Date() },
    });

    await tx.bookings.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    return updatedPayment;
  }
}

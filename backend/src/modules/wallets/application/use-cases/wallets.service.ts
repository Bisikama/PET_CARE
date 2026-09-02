import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { wallet_transaction_type, payout_status } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Hàm nội bộ để xử lý giao dịch ví một cách nguyên tử (Atomic).
   * BẮT BUỘC phải được gọi bên trong một Prisma Transaction.
   *
   * @param walletId ID của ví.
   * @param amount Số tiền giao dịch.
   * @param type Loại giao dịch (VD: CREDIT, DEBIT, ESCROW_HOLD).
   * @param bookingId ID của booking liên quan (Tùy chọn).
   * @param description Mô tả giao dịch (Tùy chọn).
   * @param tx Prisma Transaction client.
   * @returns Bản ghi giao dịch (Ledger) vừa được tạo.
   */
  async processTransaction(
    walletId: string,
    amount: number | Prisma.Decimal,
    type: wallet_transaction_type,
    bookingId: string | null,
    description: string | null,
    tx: Prisma.TransactionClient,
  ) {
    let balanceIncrement = new Prisma.Decimal(0);
    let pendingBalanceIncrement = new Prisma.Decimal(0);

    const amountDecimal = new Prisma.Decimal(amount);

    switch (type) {
      case 'CREDIT':
        // Tăng balance (Nạp tiền hoặc Refund)
        balanceIncrement = amountDecimal;
        break;
      case 'DEBIT':
        // Giảm balance (Thanh toán dịch vụ)
        balanceIncrement = amountDecimal.negated();
        break;
      case 'PAYOUT':
        // Giảm balance (Rút tiền về tài khoản ngân hàng)
        balanceIncrement = amountDecimal.negated();
        break;
      case 'ESCROW_HOLD':
        // Tăng pending_balance (Tiền ký quỹ chờ đối soát)
        pendingBalanceIncrement = amountDecimal;
        break;
      case 'ESCROW_RELEASE':
        // Giảm pending_balance và tăng balance (Chuyển tiền vào Available balance)
        pendingBalanceIncrement = amountDecimal.negated();
        balanceIncrement = amountDecimal;
        break;
      default:
        throw new InternalServerErrorException(`Loại giao dịch không hợp lệ: ${(type as string)}`);
    }

    // Cập nhật nguyên tử (Atomic update) để tránh Race Condition
    const updatedWallet = await tx.wallets.update({
      where: { id: walletId },
      data: {
        balance: {
          increment: balanceIncrement,
        },
        pending_balance: {
          increment: pendingBalanceIncrement,
        },
      },
    });

    if (updatedWallet.balance.lessThan(0)) {
      throw new Error(`Số dư không đủ trong ví ${walletId}`);
    }

    // Ghi Sổ cái (Ledger)
    const transactionRecord = await tx.wallet_transactions.create({
      data: {
        wallet_id: walletId,
        type: type,
        amount: amountDecimal,
        balance_after: updatedWallet.balance,
        booking_id: bookingId,
        description: description,
      },
    });

    return transactionRecord;
  }

  /**
   * Yêu cầu rút tiền (Provider Request Payout)
   *
   * @param providerId ID của Provider
   * @param amount Số tiền muốn rút
   */
  async createPayoutRequest(providerId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền rút phải lớn hơn 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallets.findUnique({
        where: { user_id: providerId },
      });

      if (!wallet) {
        throw new BadRequestException('Không tìm thấy ví của Provider');
      }

      if (wallet.balance.lessThan(amount)) {
        throw new ConflictException('Số dư khả dụng không đủ để rút tiền');
      }

      // 1. Ghi nhận giao dịch trừ tiền (PAYOUT)
      await this.processTransaction(
        wallet.id,
        amount,
        'PAYOUT',
        null,
        'Yêu cầu rút tiền về tài khoản ngân hàng',
        tx,
      );

      // 2. Tạo bản ghi chờ duyệt (PENDING)
      const request = await tx.payout_requests.create({
        data: {
          provider_id: providerId,
          amount: amount,
          status: payout_status.PAYOUT_PENDING,
        },
      });

      return request;
    });
  }

  /**
   * Lấy danh sách yêu cầu rút tiền của Provider
   * @param providerId ID của Provider
   */
  async getPayoutRequests(providerId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payout_requests.findMany({
        where: { provider_id: providerId },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.payout_requests.count({
        where: { provider_id: providerId },
      }),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }
}

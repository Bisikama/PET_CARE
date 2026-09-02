import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { WalletsService } from './application/use-cases/wallets.service';
import { GetCurrentUserId } from '../../common/decorators/get-current-user-id.decorator';
import { PrismaService } from '../../database/prisma.service';
import { AccessTokenGuard } from '../../common/guards/access-token.guard';

@ApiTags('Wallets')
@Controller('wallets')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin số dư ví hiện tại (Available & Pending)' })
  @ApiResponse({ status: 200, description: 'Trả về số dư ví.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getMyWallet(@GetCurrentUserId() userId: string) {
    const wallet = await this.prisma.wallets.findUnique({
      where: { user_id: userId },
    });
    
    if (!wallet) {
      return { balance: 0, pendingBalance: 0 };
    }
    
    return {
      balance: Number(wallet.balance),
      pendingBalance: Number(wallet.pending_balance),
    };
  }

  @Get('me/transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy lịch sử biến động số dư (Sổ cái)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi trên mỗi trang (Mặc định: 20)' })
  @ApiResponse({ status: 200, description: 'Danh sách lịch sử giao dịch.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getMyTransactions(
    @GetCurrentUserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const wallet = await this.prisma.wallets.findUnique({
      where: { user_id: userId },
    });
    
    if (!wallet) {
      return { data: [], total: 0 };
    }

    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      this.prisma.wallet_transactions.findMany({
        where: { wallet_id: wallet.id },
        orderBy: { created_at: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.wallet_transactions.count({
        where: { wallet_id: wallet.id },
      })
    ]);

    return {
      data: transactions,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  @Post('me/payout-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gửi yêu cầu rút tiền về tài khoản ngân hàng (Provider)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Số tiền muốn rút (VNĐ)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Yêu cầu rút tiền được tạo thành công chờ duyệt.' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy ví hoặc số dư không hợp lệ (Validation Error).' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Số dư khả dụng không đủ để rút tiền (Conflict).' })
  async requestPayout(
    @GetCurrentUserId() userId: string,
    @Body('amount') amount: number,
  ) {
    return this.walletsService.createPayoutRequest(userId, amount);
  }

  @Get('me/payout-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu rút tiền của tôi (Provider)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Trang hiện tại (Mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi trên mỗi trang (Mặc định: 20)' })
  @ApiResponse({ status: 200, description: 'Danh sách yêu cầu rút tiền.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  async getMyPayoutRequests(
    @GetCurrentUserId() userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.walletsService.getPayoutRequests(userId, Number(page), Number(limit));
  }
}

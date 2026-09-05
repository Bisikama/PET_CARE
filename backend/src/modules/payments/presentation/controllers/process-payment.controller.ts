import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { ProcessPaymentDto } from '../../dto/process-payment.dto';
import { AccessTokenGuard } from '../../../../common/guards/access-token.guard';
import { GetCurrentUserId } from '../../../../common/decorators/get-current-user-id.decorator';

@ApiTags('Payments')
@Controller('api/payments')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class ProcessPaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post('process')
  @ApiOperation({ summary: 'Xử lý thanh toán Booking (Kèm khóa dòng Database Pessimistic Lock)' })
  @ApiResponse({ status: 201, description: 'Thanh toán và chốt mã giảm giá thành công.', schema: { example: { success: true, message: 'Thanh toán thành công', bookingId: 'book-123' } } })
  @ApiResponse({ status: 400, description: 'Mã giảm giá đã hết hạn giữ chỗ (Redis TTL Timeout) hoặc dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized).' })
  @ApiResponse({ status: 409, description: 'Mã giảm giá đã chạm trần (Conflict).' })
  async processPayment(
    @GetCurrentUserId() userId: string,
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.processPaymentUseCase.execute({
      bookingId: dto.bookingId,
      userId,
      promoCode: dto.promoCode,
      paymentMethod: dto.paymentMethod,
      amount: dto.amount,
    });
  }
}

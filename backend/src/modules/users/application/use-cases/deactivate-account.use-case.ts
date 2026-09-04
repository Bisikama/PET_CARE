import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { DeactivateAccountDto } from '../../dto/deactivate-account.dto';

@Injectable()
export class DeactivateAccountUseCase {
  private readonly logger = new Logger(DeactivateAccountUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: DeactivateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if there's already a pending request
    const existingRequest = await this.prisma.account_deactivation_requests.findFirst({
      where: {
        user_id: userId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new ConflictException('Request is already pending');
    }

    // Create a new request
    const request = await this.prisma.account_deactivation_requests.create({
      data: {
        user_id: userId,
        reason: dto.reason,
      },
    });

    this.logger.log(`User ${userId} requested account deactivation. Request ID: ${request.id}`);

    return {
      message: 'Your account deactivation request has been submitted and is pending review.',
      requestId: request.id,
    };
  }
}

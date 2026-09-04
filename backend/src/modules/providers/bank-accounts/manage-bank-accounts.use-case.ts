import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class ManageBankAccountsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateBankAccountDto) {
    // Check if provider exists
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new ForbiddenException('Chỉ Provider mới có thể thêm tài khoản ngân hàng');
    }

    // Check existing bank accounts to determine is_default
    const existingAccountsCount = await this.prisma.provider_bank_accounts.count({
      where: { provider_id: provider.id },
    });

    const isFirstAccount = existingAccountsCount === 0;
    const isDefault = dto.is_default || isFirstAccount;

    return this.prisma.$transaction(async (tx) => {
      // If setting as default, unset others
      if (isDefault && !isFirstAccount) {
        await tx.provider_bank_accounts.updateMany({
          where: { provider_id: provider.id, is_default: true },
          data: { is_default: false },
        });
      }

      return tx.provider_bank_accounts.create({
        data: {
          provider_id: provider.id,
          bank_name: dto.bank_name,
          account_number: dto.account_number,
          account_name: dto.account_name,
          branch: dto.branch,
          is_default: isDefault,
        },
      });
    });
  }

  async findAll(userId: string) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new ForbiddenException('Chỉ Provider mới có thể xem tài khoản ngân hàng');
    }

    return this.prisma.provider_bank_accounts.findMany({
      where: { provider_id: provider.id },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' }
      ],
    });
  }

  async update(userId: string, accountId: string, dto: UpdateBankAccountDto) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!provider) {
      throw new ForbiddenException('Chỉ Provider mới có thể cập nhật tài khoản ngân hàng');
    }

    const account = await this.prisma.provider_bank_accounts.findUnique({
      where: { id: accountId },
    });

    if (!account || account.provider_id !== provider.id) {
      throw new NotFoundException('Không tìm thấy tài khoản ngân hàng');
    }

    return this.prisma.$transaction(async (tx) => {
      // If updating to default, unset others
      if (dto.is_default && !account.is_default) {
        await tx.provider_bank_accounts.updateMany({
          where: { provider_id: provider.id, is_default: true, id: { not: accountId } },
          data: { is_default: false },
        });
      }

      return tx.provider_bank_accounts.update({
        where: { id: accountId },
        data: {
          bank_name: dto.bank_name,
          account_number: dto.account_number,
          account_name: dto.account_name,
          branch: dto.branch,
          is_default: dto.is_default,
        },
      });
    });
  }
}

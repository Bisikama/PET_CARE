import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ManageBankAccountsUseCase } from './manage-bank-accounts.use-case';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { AccessTokenGuard } from '../../../common/guards/access-token.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetCurrentUserId } from '../../../common/decorators/get-current-user-id.decorator';

@ApiTags('Provider Bank Accounts')
@Controller('providers/me/bank-accounts')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.PROVIDER)
@ApiBearerAuth()
export class BankAccountsController {
  constructor(private readonly manageBankAccountsUseCase: ManageBankAccountsUseCase) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm tài khoản ngân hàng' })
  @ApiBody({ type: CreateBankAccountDto })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản ngân hàng thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Chỉ Provider mới có quyền)' })
  create(
    @GetCurrentUserId() userId: string,
    @Body() createBankAccountDto: CreateBankAccountDto,
  ) {
    return this.manageBankAccountsUseCase.create(userId, createBankAccountDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách tài khoản ngân hàng của Provider' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Chỉ Provider mới có quyền)' })
  findAll(@GetCurrentUserId() userId: string) {
    return this.manageBankAccountsUseCase.findAll(userId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật tài khoản ngân hàng (Sửa/Đặt làm mặc định)' })
  @ApiBody({ type: UpdateBankAccountDto })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực (Unauthorized)' })
  @ApiResponse({ status: 403, description: 'Forbidden (Chỉ Provider mới có quyền)' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản ngân hàng' })
  update(
    @GetCurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ) {
    return this.manageBankAccountsUseCase.update(userId, id, updateBankAccountDto);
  }
}

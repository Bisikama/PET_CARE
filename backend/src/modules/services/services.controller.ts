import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete-service.use-case';
import { GetServicesUseCase } from './application/use-cases/get-services.use-case';
import { ManagePricingRuleUseCase } from './application/use-cases/manage-pricing-rule.use-case';
import { ManageChecklistTemplateUseCase } from './application/use-cases/manage-checklist-template.use-case';
import { ManageCancellationPolicyUseCase } from './application/use-cases/manage-cancellation-policy.use-case';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { CreateCancellationPolicyDto } from './dto/create-cancellation-policy.dto';

@ApiTags('Services')
@ApiBearerAuth()
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly managePricingRuleUseCase: ManagePricingRuleUseCase,
    private readonly manageChecklistTemplateUseCase: ManageChecklistTemplateUseCase,
    private readonly manageCancellationPolicyUseCase: ManageCancellationPolicyUseCase,
  ) {}

  // ==========================================
  // SERVICE ENDPOINTS
  // ==========================================

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo gói dịch vụ mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo gói dịch vụ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu yêu cầu không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 409, description: 'Tên gói dịch vụ đã tồn tại.' })
  async create(@Body() dto: CreateServiceDto) {
    return this.createServiceUseCase.execute(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin gói dịch vụ (Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật gói dịch vụ thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ yêu cầu.' })
  @ApiResponse({ status: 409, description: 'Tên gói dịch vụ mới đã tồn tại.' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.updateServiceUseCase.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm gói dịch vụ (Admin)' })
  @ApiResponse({ status: 204, description: 'Xóa mềm gói dịch vụ thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ yêu cầu.' })
  async delete(@Param('id') id: string) {
    await this.deleteServiceUseCase.execute(id);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách các gói dịch vụ hoạt động (Công khai)' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách gói dịch vụ thành công.' })
  async findAll() {
    return this.getServicesUseCase.executeList();
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy chi tiết gói dịch vụ (Công khai)' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin chi tiết gói dịch vụ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ yêu cầu.' })
  async findOne(@Param('id') id: string) {
    return this.getServicesUseCase.executeDetail(id);
  }

  // ==========================================
  // PRICING RULE ENDPOINTS
  // ==========================================

  @Post(':id/pricing-rules')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm bảng giá cho gói dịch vụ (Admin)' })
  @ApiResponse({ status: 201, description: 'Thêm bảng giá thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu bảng giá không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ tương ứng.' })
  async createPricingRule(@Param('id') serviceId: string, @Body() dto: CreatePricingRuleDto) {
    return this.managePricingRuleUseCase.create({
      serviceId,
      ...dto,
    });
  }

  @Patch('pricing-rules/:ruleId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật bảng giá dịch vụ (Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật bảng giá thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá yêu cầu.' })
  async updatePricingRule(@Param('ruleId') ruleId: string, @Body() dto: UpdatePricingRuleDto) {
    return this.managePricingRuleUseCase.update(ruleId, dto);
  }

  @Delete('pricing-rules/:ruleId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm bảng giá dịch vụ (Admin)' })
  @ApiResponse({ status: 204, description: 'Xóa mềm bảng giá thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bảng giá yêu cầu.' })
  async deletePricingRule(@Param('ruleId') ruleId: string) {
    await this.managePricingRuleUseCase.delete(ruleId);
  }

  @Public()
  @Get(':id/pricing-rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách các bảng giá của gói dịch vụ' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bảng giá thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ yêu cầu.' })
  async getPricingRules(@Param('id') serviceId: string) {
    return this.managePricingRuleUseCase.getByServiceId(serviceId);
  }

  // ==========================================
  // CHECKLIST TEMPLATE ENDPOINTS
  // ==========================================

  @Post(':id/checklist-templates')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm checklist template cho dịch vụ (Admin)' })
  @ApiResponse({ status: 201, description: 'Thêm checklist template thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu checklist không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ tương ứng.' })
  async createChecklistTemplate(
    @Param('id') serviceId: string,
    @Body() dto: CreateChecklistTemplateDto,
  ) {
    return this.manageChecklistTemplateUseCase.create({
      serviceId,
      ...dto,
    });
  }

  @Patch('checklist-templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật checklist template (Admin)' })
  @ApiResponse({ status: 200, description: 'Cập nhật checklist template thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cập nhật không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy checklist template yêu cầu.' })
  async updateChecklistTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdateChecklistTemplateDto,
  ) {
    return this.manageChecklistTemplateUseCase.update(templateId, dto);
  }

  @Delete('checklist-templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa mềm checklist template (Admin)' })
  @ApiResponse({ status: 204, description: 'Xóa mềm checklist template thành công.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy checklist template yêu cầu.' })
  async deleteChecklistTemplate(@Param('templateId') templateId: string) {
    await this.manageChecklistTemplateUseCase.delete(templateId);
  }

  @Public()
  @Get(':id/checklist-templates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy các checklist template của gói dịch vụ' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách checklist template thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói dịch vụ yêu cầu.' })
  async getChecklistTemplates(@Param('id') serviceId: string) {
    return this.manageChecklistTemplateUseCase.getByServiceId(serviceId);
  }

  // ==========================================
  // CANCELLATION POLICY ENDPOINTS
  // ==========================================

  @Post('../cancellation-policies') // Custom route
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo chính sách hủy mới (Admin)' })
  @ApiResponse({ status: 201, description: 'Tạo chính sách hủy thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu cấu hình không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực người dùng.' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện hành động này.' })
  async createCancellationPolicy(@Body() dto: CreateCancellationPolicyDto) {
    return this.manageCancellationPolicyUseCase.create(dto);
  }

  @Public()
  @Get('../cancellation-policies') // Custom route
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách các chính sách hủy' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách chính sách hủy thành công.' })
  async getCancellationPolicies() {
    return this.manageCancellationPolicyUseCase.getList();
  }
}

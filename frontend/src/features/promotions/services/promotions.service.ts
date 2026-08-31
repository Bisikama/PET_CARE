import axiosInstance from '@/lib/axios';
import { 
  Promotion, 
  CreatePromotionInput, 
  UpdatePromotionInput, 
  ValidatePromotionInput, 
  ValidatePromotionResult 
} from '../types';

export const promotionsService = {
  // Public/Customer/Provider: Lấy danh sách khuyến mãi đang áp dụng
  getActivePromotions: async (): Promise<Promotion[]> => {
    const response = await axiosInstance.get<Promotion[]>('/promotions');
    return response.data;
  },

  // Public/Customer/Provider: Kiểm tra tính hợp lệ của mã khuyến mãi với giá trị đơn hàng
  validatePromotion: async (data: ValidatePromotionInput): Promise<ValidatePromotionResult> => {
    const response = await axiosInstance.post<ValidatePromotionResult>('/promotions/validate', data);
    return response.data;
  },

  // Admin: Lấy toàn bộ danh sách mã khuyến mãi (kể cả đã hết hạn/vô hiệu hóa)
  getAllPromotionsAdmin: async (): Promise<Promotion[]> => {
    const response = await axiosInstance.get<Promotion[]>('/admin/promotions');
    return response.data;
  },

  // Admin: Tạo mã khuyến mãi mới
  createPromotion: async (data: CreatePromotionInput): Promise<Promotion> => {
    const response = await axiosInstance.post<Promotion>('/admin/promotions', data);
    return response.data;
  },

  // Admin: Cập nhật thông tin/trạng thái mã khuyến mãi
  updatePromotion: async (id: string, data: UpdatePromotionInput): Promise<Promotion> => {
    const response = await axiosInstance.put<Promotion>(`/admin/promotions/${id}`, data);
    return response.data;
  },
};

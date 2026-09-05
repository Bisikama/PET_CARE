import { useState } from 'react';
import { paymentService, CheckoutRequest } from '../services/payment.service';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutUrl = async (data: CheckoutRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.checkout(data);
      // Backend returns either { paymentUrl: ... } or { success: true, data: { paymentUrl: ... } }
      const url = response?.paymentUrl || (response as any)?.data?.paymentUrl;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Không lấy được URL thanh toán từ hệ thống');
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setError(err?.response?.data?.message || err.message || 'Không thể tạo phiên thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const checkoutWithWallet = async (data: CheckoutRequest) => {
    setLoading(true);
    setError(null);
    try {
      await paymentService.checkoutWallet(data);
      return true;
    } catch (err: any) {
      console.error('Wallet checkout error:', err);
      setError(err?.response?.data?.message || err.message || 'Thanh toán bằng ví thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyVNPayPayment = async (queryString: string) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi thử IPN trực tiếp từ Frontend (hack cho môi trường dev local vì VNPAY không tự gọi về localhost được)
      try {
        await paymentService.triggerVnpayIpn(queryString);
      } catch (e) {
        // Bỏ qua lỗi IPN nếu có
      }
      
      const response = await paymentService.verifyVNPay(queryString);
      return response;
    } catch (err: any) {
      console.error('Verify VNPay error:', err);
      setError(err?.response?.data?.message || err.message || 'Xác thực thanh toán thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutUrl,
    checkoutWithWallet,
    verifyVNPayPayment
  };
}


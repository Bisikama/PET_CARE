'use client';

import { useState, useCallback } from 'react';
import { promotionsService } from '../services/promotions.service';
import { ApplyPromotionInput, ApplyPromotionResult } from '../types';

export function useApplyPromotion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplyPromotionResult | null>(null);

  const applyPromotion = useCallback(async (data: ApplyPromotionInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await promotionsService.applyPromotion(data);
      setResult(res);
      return res;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    applyPromotion,
    isLoading,
    error,
    result,
    clearResult,
  };
}

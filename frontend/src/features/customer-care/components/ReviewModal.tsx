'use client';

import React, { useState, useEffect } from 'react';
import { Star, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';

import { Portal } from '@/components/ui/Portal';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerName?: string;
  existingReview?: {
    rating: number;
    comment?: string;
  } | null;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rất không hài lòng',
  2: 'Tạm được',
  3: 'Hài lòng',
  4: 'Rất tốt',
  5: 'Tuyệt vời',
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  providerName = 'Người chăm sóc',
  existingReview,
  onSuccess,
}) => {
  const { createReview, updateReview, loading, error } = useCustomerCareMutations();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
    } else {
      setRating(5);
      setComment('');
    }
    setIsSuccess(false);
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) return;

    try {
      if (existingReview) {
        await updateReview(bookingId, { rating, comment });
      } else {
        await createReview(bookingId, { rating, comment });
      }
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden transform transition-all scale-100 border border-slate-100">
          {/* Top gradient strip */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-[#00a86b]"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Cảm ơn bạn đã đánh giá!</h3>
              <p className="text-slate-600 text-sm max-w-xs mx-auto">
                Đánh giá của bạn giúp dịch vụ của <span className="font-semibold text-slate-800">{providerName}</span> hoàn thiện hơn mỗi ngày.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-amber-50 text-amber-500 mb-1">
                  <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  {existingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá dịch vụ'}
                </h3>
                <p className="text-slate-500 text-sm">
                  Hãy chia sẻ trải nghiệm dịch vụ chăm sóc thú cưng của đối tác{' '}
                  <span className="font-bold text-slate-800">{providerName}</span>
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl font-medium">
                  {error}
                </div>
              )}

              {/* Rating Stars Selection */}
              <div className="flex flex-col items-center space-y-2 py-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1.5 transform hover:scale-125 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 ${
                          star <= activeRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                            : 'text-slate-300 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-600 h-5">
                  {RATING_LABELS[activeRating] || ''}
                </span>
              </div>

              {/* Comment Area */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Nhận xét chi tiết (tùy chọn)
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập cảm nhận của bạn về sự chu đáo, thời gian, thái độ chăm sóc bé..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 placeholder-slate-400 text-sm resize-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/30"
                >
                  {loading ? 'Đang gửi...' : existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
};

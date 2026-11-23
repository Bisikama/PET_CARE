import { useCallback, useEffect, useState } from 'react';
import { bankTransactionService } from '../services/bank-transaction.service';
import type { BankTransactionList, BankTransactionStatus } from '../types';

export const BANK_TXN_PAGE_SIZE = 20;

export function bankTxnErrorMessage(err: unknown, fallback: string) {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = e?.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || e?.message || fallback;
}

type Result = { key: string; data: BankTransactionList | null; error: string | null };

/** Tải sổ giao dịch ngân hàng theo bộ lọc; `reload()` để tải lại sau khi xử lý. */
export function useBankTransactions(filter: {
  status: BankTransactionStatus | 'ALL';
  page: number;
  q: string;
}) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result>({ key: '', data: null, error: null });
  const requestKey = `${filter.status}|${filter.page}|${filter.q}|${reloadKey}`;

  useEffect(() => {
    let cancelled = false;
    bankTransactionService
      .list({ status: filter.status, page: filter.page, limit: BANK_TXN_PAGE_SIZE, q: filter.q })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult((prev) => ({
            key: requestKey,
            data: prev.data,
            error: bankTxnErrorMessage(err, 'Không tải được danh sách giao dịch'),
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [filter.status, filter.page, filter.q, requestKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    // Giữ dữ liệu cũ trong lúc tải để bảng không nhấp nháy
    data: result.data,
    error: result.key === requestKey ? result.error : null,
    isLoading: result.key !== requestKey,
    reload,
  };
}

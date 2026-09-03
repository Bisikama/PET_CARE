import { useSettlementStore } from '../stores/settlement.store';

export const useSettlementActions = () => {
  const { approvePayout, rejectPayout, releaseEscrow, refundCustomer } = useSettlementStore();

  return { approvePayout, rejectPayout, releaseEscrow, refundCustomer };
};

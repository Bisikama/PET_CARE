import { useState, useCallback } from 'react';
import { adminCareService } from '../services/admin-care.service';
import { useAdminCareStore } from '../stores/admin-care.store';
import {
  ReplyTicketAdminRequest,
  UpdateTicketStatusRequest,
  ResolveDisputeRequest,
  ResolveIncidentRequest,
} from '../types';

export function useAllTickets() {
  const { allTickets, setAllTickets } = useAdminCareStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (forceRefresh = false) => {
    if (allTickets && !forceRefresh) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await adminCareService.getAllTickets();
      setAllTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi lấy danh sách yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  }, [allTickets, setAllTickets]);

  return { allTickets, loading, error, fetchTickets };
}

export function useAdminTicketDetails(ticketId: string) {
  const { ticketDetails, setTicketDetail } = useAdminCareStore();
  const ticket = ticketDetails[ticketId];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketDetails = useCallback(async (forceRefresh = false) => {
    if (!ticketId) return;
    if (ticket && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const data = await adminCareService.getTicketDetails(ticketId);
      setTicketDetail(ticketId, data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải chi tiết yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  }, [ticketId, ticket, setTicketDetail]);

  return { ticket, loading, error, fetchTicketDetails };
}

export function useAllDisputes() {
  const { allDisputes, setAllDisputes } = useAdminCareStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async (forceRefresh = false) => {
    if (allDisputes && !forceRefresh) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await adminCareService.getAllDisputes();
      setAllDisputes(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi lấy danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  }, [allDisputes, setAllDisputes]);

  return { allDisputes, loading, error, fetchDisputes };
}

export function useAdminCareMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withMutation = async <T,>(mutationFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn();
      return result;
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Thao tác thất bại');
      throw err; // Re-throw
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    hideReview: (reviewId: string) => 
      withMutation(() => adminCareService.hideReview(reviewId)),
      
    replyTicketAdmin: (ticketId: string, data: ReplyTicketAdminRequest) => 
      withMutation(() => adminCareService.replyTicketAdmin(ticketId, data)),
      
    updateTicketStatus: (ticketId: string, data: UpdateTicketStatusRequest) => 
      withMutation(() => adminCareService.updateTicketStatus(ticketId, data)),
      
    resolveDispute: (disputeId: string, data: ResolveDisputeRequest) => 
      withMutation(() => adminCareService.resolveDispute(disputeId, data)),
      
    resolveIncident: (incidentId: string, data: ResolveIncidentRequest) => 
      withMutation(() => adminCareService.resolveIncident(incidentId, data)),
  };
}

import { useState, useCallback } from 'react';
import { customerCareService } from '../services/customer-care.service';
import { useCustomerCareStore } from '../stores/customer-care.store';
import {
  CreateReviewRequest,
  CreateTicketRequest,
  ReplyTicketRequest,
  OpenDisputeRequest,
  ReportIncidentRequest,
} from '../types';

export function useMyTickets() {
  const { myTickets, setMyTickets } = useCustomerCareStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async (forceRefresh = false) => {
    if (myTickets && !forceRefresh) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await customerCareService.getMyTickets();
      setMyTickets(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi lấy danh sách yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  }, [myTickets, setMyTickets]);

  return { myTickets, loading, error, fetchTickets };
}

export function useTicketDetails(ticketId: string) {
  const { ticketDetails, setTicketDetail } = useCustomerCareStore();
  const ticket = ticketDetails[ticketId];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketDetails = useCallback(async (forceRefresh = false) => {
    if (!ticketId) return;
    if (ticket && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const data = await customerCareService.getTicketDetails(ticketId);
      setTicketDetail(ticketId, data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải chi tiết yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  }, [ticketId, ticket, setTicketDetail]);

  return { ticket, loading, error, fetchTicketDetails };
}

export function useProviderReviews(providerId: string, page = 1, limit = 10) {
  const { providerReviews, setProviderReviews } = useCustomerCareStore();
  const reviewsData = providerReviews[providerId];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (forceRefresh = false) => {
    if (!providerId) return;
    // Basic caching for page 1, real app might need more robust cache key based on page & limit
    if (reviewsData && reviewsData.page === page && !forceRefresh) return;

    setLoading(true);
    setError(null);
    try {
      const data = await customerCareService.getProviderReviews(providerId, page, limit);
      setProviderReviews(providerId, data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [providerId, page, limit, reviewsData, setProviderReviews]);

  return { reviewsData, loading, error, fetchReviews };
}

export function useCustomerCareMutations() {
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
      throw err; // Re-throw so component can catch it if needed
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createReview: (bookingId: string, data: CreateReviewRequest) => 
      withMutation(() => customerCareService.createReview(bookingId, data)),
      
    createTicket: (data: CreateTicketRequest) => 
      withMutation(() => customerCareService.createTicket(data)),
      
    replyTicket: (ticketId: string, data: ReplyTicketRequest) => 
      withMutation(() => customerCareService.replyTicket(ticketId, data)),
      
    openDispute: (bookingId: string, data: OpenDisputeRequest) => 
      withMutation(() => customerCareService.openDispute(bookingId, data)),
      
    reportIncident: (bookingId: string, data: ReportIncidentRequest) => 
      withMutation(() => customerCareService.reportIncident(bookingId, data)),
  };
}

import axiosInstance from '@/lib/axios';
import {
  CreateReviewRequest,
  CreateTicketRequest,
  ReplyTicketRequest,
  OpenDisputeRequest,
  ReportIncidentRequest,
  Ticket,
  PaginationResponse,
  Review,
} from '../types';

export const customerCareService = {
  // --- REVIEWS ---
  getProviderReviews: async (providerId: string, page = 1, limit = 10): Promise<PaginationResponse<Review>> => {
    const response = await axiosInstance.get(`/customer-care/providers/${providerId}/reviews`, {
      params: { page, limit },
    });
    return response.data;
  },

  createReview: async (bookingId: string, data: CreateReviewRequest): Promise<any> => {
    const response = await axiosInstance.post(`/customer-care/bookings/${bookingId}/reviews`, data);
    return response.data;
  },

  updateReview: async (bookingId: string, data: CreateReviewRequest): Promise<any> => {
    const response = await axiosInstance.put(`/customer-care/bookings/${bookingId}/reviews`, data);
    return response.data;
  },

  // --- SUPPORT TICKETS ---
  createTicket: async (data: CreateTicketRequest): Promise<any> => {
    const response = await axiosInstance.post('/customer-care/tickets', data);
    return response.data;
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    const response = await axiosInstance.get('/customer-care/tickets');
    return response.data;
  },

  getTicketDetails: async (ticketId: string): Promise<Ticket> => {
    const response = await axiosInstance.get(`/customer-care/tickets/${ticketId}`);
    return response.data;
  },

  replyTicket: async (ticketId: string, data: ReplyTicketRequest): Promise<any> => {
    const response = await axiosInstance.post(`/customer-care/tickets/${ticketId}/reply`, data);
    return response.data;
  },

  // --- DISPUTES ---
  openDispute: async (bookingId: string, data: OpenDisputeRequest): Promise<any> => {
    const formData = new FormData();
    formData.append('reason', data.reason);
    formData.append('title', data.title);
    formData.append('description', data.description);

    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axiosInstance.post(`/customer-care/bookings/${bookingId}/disputes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // --- INCIDENTS ---
  reportIncident: async (bookingId: string, data: ReportIncidentRequest): Promise<any> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('description', data.description);

    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await axiosInstance.post(`/customer-care/bookings/${bookingId}/incidents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

import axiosInstance from '@/lib/axios';
import {
  ReplyTicketAdminRequest,
  UpdateTicketStatusRequest,
  ResolveDisputeRequest,
  ResolveIncidentRequest,
  Ticket,
  Dispute,
} from '../types';

export const adminCareService = {
  // --- REVIEWS ---
  hideReview: async (reviewId: string): Promise<any> => {
    const response = await axiosInstance.put(`/admin/customer-care/reviews/${reviewId}/hide`);
    return response.data;
  },

  // --- SUPPORT TICKETS ---
  getAllTickets: async (): Promise<Ticket[]> => {
    const response = await axiosInstance.get('/admin/customer-care/tickets');
    return response.data;
  },

  getTicketDetails: async (ticketId: string): Promise<Ticket> => {
    const response = await axiosInstance.get(`/admin/customer-care/tickets/${ticketId}`);
    return response.data;
  },

  replyTicketAdmin: async (ticketId: string, data: ReplyTicketAdminRequest): Promise<any> => {
    const response = await axiosInstance.post(`/admin/customer-care/tickets/${ticketId}/reply`, data);
    return response.data;
  },

  updateTicketStatus: async (ticketId: string, data: UpdateTicketStatusRequest): Promise<any> => {
    const response = await axiosInstance.put(`/admin/customer-care/tickets/${ticketId}/status`, data);
    return response.data;
  },

  // --- DISPUTES ---
  getAllDisputes: async (): Promise<Dispute[]> => {
    const response = await axiosInstance.get('/admin/customer-care/disputes');
    return response.data;
  },

  resolveDispute: async (disputeId: string, data: ResolveDisputeRequest): Promise<any> => {
    const response = await axiosInstance.put(`/admin/customer-care/disputes/${disputeId}/resolve`, data);
    return response.data;
  },

  // --- INCIDENTS ---
  resolveIncident: async (incidentId: string, data: ResolveIncidentRequest): Promise<any> => {
    const response = await axiosInstance.put(`/admin/customer-care/incidents/${incidentId}/resolve`, data);
    return response.data;
  },
};

import { create } from 'zustand';
import { Ticket, Review, PaginationResponse } from '../types';

interface CustomerCareState {
  // Data
  myTickets: Ticket[] | null;
  ticketDetails: Record<string, Ticket>; // key: ticketId
  providerReviews: Record<string, PaginationResponse<Review>>; // key: providerId

  // Actions
  setMyTickets: (tickets: Ticket[]) => void;
  setTicketDetail: (ticketId: string, ticket: Ticket) => void;
  setProviderReviews: (providerId: string, reviews: PaginationResponse<Review>) => void;
  clearCache: () => void;
}

export const useCustomerCareStore = create<CustomerCareState>((set) => ({
  myTickets: null,
  ticketDetails: {},
  providerReviews: {},

  setMyTickets: (tickets) => set({ myTickets: tickets }),
  
  setTicketDetail: (ticketId, ticket) => 
    set((state) => ({
      ticketDetails: {
        ...state.ticketDetails,
        [ticketId]: ticket,
      },
    })),

  setProviderReviews: (providerId, reviews) =>
    set((state) => ({
      providerReviews: {
        ...state.providerReviews,
        [providerId]: reviews,
      },
    })),

  clearCache: () => set({ myTickets: null, ticketDetails: {}, providerReviews: {} }),
}));

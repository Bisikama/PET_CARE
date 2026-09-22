import { create } from 'zustand';
import { Ticket, Dispute } from '../types';

interface AdminCareState {
  // Data
  allTickets: Ticket[] | null;
  allDisputes: Dispute[] | null;
  ticketDetails: Record<string, Ticket>; // key: ticketId

  // Actions
  setAllTickets: (tickets: Ticket[]) => void;
  setAllDisputes: (disputes: Dispute[]) => void;
  setTicketDetail: (ticketId: string, ticket: Ticket) => void;
  clearCache: () => void;
}

export const useAdminCareStore = create<AdminCareState>((set) => ({
  allTickets: null,
  allDisputes: null,
  ticketDetails: {},

  setAllTickets: (tickets) => set({ allTickets: tickets }),
  
  setAllDisputes: (disputes) => set({ allDisputes: disputes }),
  
  setTicketDetail: (ticketId, ticket) => 
    set((state) => ({
      ticketDetails: {
        ...state.ticketDetails,
        [ticketId]: ticket,
      },
    })),

  clearCache: () => set({ allTickets: null, allDisputes: null, ticketDetails: {} }),
}));

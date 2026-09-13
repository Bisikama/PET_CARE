// Re-export common types from customer-care
export {
  SupportTicketCategory,
  TicketStatus,
  DisputeReason,
  IncidentType,
} from '../../customer-care/types';

export type {
  TicketMessage,
  Ticket,
  Dispute,
  Incident,
  PaginationResponse,
} from '../../customer-care/types';

import { TicketStatus } from '../../customer-care/types';

// Admin Specific Enums
export enum DisputeDecision {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND',
}

export enum IncidentStatus {
  RESOLVED = 'RESOLVED',
  PENDING = 'PENDING',
}

// Request DTOs
export interface ReplyTicketAdminRequest {
  content: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface ResolveDisputeRequest {
  decision: DisputeDecision;
  resolutionNote: string;
}

export interface ResolveIncidentRequest {
  status: IncidentStatus;
  resolutionNote: string;
}

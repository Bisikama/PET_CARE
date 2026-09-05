// Enums corresponding to Prisma schema
export enum SupportTicketCategory {
  GENERAL = 'GENERAL',
  PAYMENT = 'PAYMENT',
  ACCOUNT = 'ACCOUNT',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum DisputeReason {
  PROVIDER_NO_SHOW = 'PROVIDER_NO_SHOW',
  CUSTOMER_NO_SHOW = 'CUSTOMER_NO_SHOW',
  UNSATISFACTORY_SERVICE = 'UNSATISFACTORY_SERVICE',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  OTHER = 'OTHER',
}

export enum IncidentType {
  PET_HEALTH_EMERGENCY = 'PET_HEALTH_EMERGENCY',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  SAFETY_CONCERN = 'SAFETY_CONCERN',
  OTHER = 'OTHER',
}

// Interfaces
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Ticket {
  id: string;
  customer_id: string;
  category: SupportTicketCategory;
  title: string;
  description: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages?: TicketMessage[];
}

export interface Dispute {
  id: string;
  booking_id: string;
  customer_id: string;
  reason: DisputeReason;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  booking_id: string;
  reporter_id: string;
  type: IncidentType;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Request DTOs
export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface CreateTicketRequest {
  category: SupportTicketCategory;
  title: string;
  description: string;
}

export interface ReplyTicketRequest {
  content: string;
}

export interface OpenDisputeRequest {
  reason: DisputeReason;
  title: string;
  description: string;
  files?: File[];
}

export interface ReportIncidentRequest {
  type: IncidentType;
  description: string;
  files?: File[];
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

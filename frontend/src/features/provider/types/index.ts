export interface ProviderUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderMeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProviderUser;
}

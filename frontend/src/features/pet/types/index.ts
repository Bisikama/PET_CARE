// Export all types for pets here
export interface Pet {
  id: string;
  customerId: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

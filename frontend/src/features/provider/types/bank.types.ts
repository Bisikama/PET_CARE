export interface ProviderBankAccount {
  id: string;
  provider_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateBankAccountPayload {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
  is_default?: boolean;
}

export interface UpdateBankAccountPayload {
  is_default: boolean;
}

export type ApiUser = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  tenant_id?: string | null;
  email_verified_at?: string | null;
  created_at?: string | null;
  verification_level?: string | null;
  wallet?: ApiWallet | null;
};

export type ApiWallet = {
  id?: string;
  currency: string;
  balance_minor: number;
  user_id?: string;
};

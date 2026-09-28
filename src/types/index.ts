export type CardBrand = 'Mastercard' | 'Visa' | 'Elo' | 'Amex' | 'Hipercard';

export interface Card {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  last_four: string;
  brand: CardBrand;
  color_gradient: string;
  total_limit: number;
  closing_day: number;
  due_day: number;
  archived?: boolean;
  created_at: string;
  // Computed fields
  used_limit?: number;
  available_limit?: number;
  best_buy_day?: number;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  is_default?: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id: string;
  category_id?: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  total_installments: number;
  notes?: string;
  tags?: string[];
  created_at: string;
}

export interface Installment {
  id: string;
  transaction_id: string;
  user_id: string;
  card_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;      // YYYY-MM-DD
  invoice_month: string; // YYYY-MM
  status: 'pending' | 'paid';
  created_at?: string;
  // Virtual joined fields
  description?: string;
  category_id?: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  card_id: string;
  month: string;         // YYYY-MM
  closing_date: string;  // YYYY-MM-DD
  due_date: string;      // YYYY-MM-DD
  total_amount: number;
  status: 'open' | 'closed' | 'paid';
  paid_at?: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  currency?: string;
}

export interface ExtractedTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  suggested_category: string;
  raw_line: string;
  selected: boolean;
}

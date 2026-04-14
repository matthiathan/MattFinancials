export interface Profile {
  id: string;
  email: string;
  net_worth: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
}

export interface Investment {
  id: string;
  user_id: string;
  ticker: string;
  shares: number;
  avg_price: number;
  current_price: number;
}

export interface FinancialEvent {
  id: string;
  user_id: string;
  event_type: 'salary' | 'bill' | 'subscription' | 'investment' | 'expense';
  title: string;
  amount: number;
  event_date: string;
  recurrence: string;
}

export interface BudgetRecommendation {
  id: string;
  user_id: string;
  category: string;
  average_spending: number;
  suggested_budget: number;
  confidence: number;
}

export interface CreditScore {
  id: string;
  user_id: string;
  score: number;
  source: string;
  recorded_at: string;
  credit_limit?: number;
  credit_balance?: number;
}

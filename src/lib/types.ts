export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  date: string; // ISO date string
  category: string;
  categoryId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  ledgerId?: string;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  ledgerId?: string;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: TransactionType | 'All';
  searchQuery?: string;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
  color: string;
}

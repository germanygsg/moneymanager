import { Transaction, Category } from './types';

const TRANSACTIONS_KEY = 'dexter_cashflow_transactions';
const CATEGORIES_KEY = 'dexter_cashflow_categories';

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'food', name: 'Food', type: 'Expense', color: '#FF6B6B', icon: 'restaurant' },
    { id: 'transport', name: 'Transport', type: 'Expense', color: '#4ECDC4', icon: 'directions_car' },
    { id: 'shopping', name: 'Shopping', type: 'Expense', color: '#FFE66D', icon: 'shopping_cart' },
    { id: 'entertainment', name: 'Entertainment', type: 'Expense', color: '#A8E6CF', icon: 'movie' },
    { id: 'utilities', name: 'Utilities', type: 'Expense', color: '#FF8B94', icon: 'bolt' },
    { id: 'healthcare', name: 'Healthcare', type: 'Expense', color: '#C7CEEA', icon: 'local_hospital' },
    { id: 'salary', name: 'Salary', type: 'Income', color: '#95E1D3', icon: 'payments' },
    { id: 'business', name: 'Business', type: 'Income', color: '#F38181', icon: 'business_center' },
    { id: 'investment', name: 'Investment', type: 'Income', color: '#AA96DA', icon: 'trending_up' },
    { id: 'other', name: 'Other', type: 'Expense', color: '#FCBAD3', icon: 'more_horiz' },
];

// Transactions
export const getTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const updateTransaction = (id: string, updatedTransaction: Transaction): void => {
    const transactions = getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
        transactions[index] = updatedTransaction;
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
};

export const deleteTransaction = (id: string): void => {
    const transactions = getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
};

// Categories
export const getCategories = (): Category[] => {
    if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
};

export const saveCategory = (category: Category): void => {
    const categories = getCategories();
    categories.push(category);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const updateCategory = (id: string, updatedCategory: Category): void => {
    const categories = getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
        categories[index] = updatedCategory;
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }
};

export const deleteCategory = (id: string): void => {
    const categories = getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
};

export const initializeStorage = (): void => {
    if (typeof window === 'undefined') return;

    // Initialize categories if not exists
    if (!localStorage.getItem(CATEGORIES_KEY)) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    }

    // Initialize transactions if not exists
    if (!localStorage.getItem(TRANSACTIONS_KEY)) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([]));
    }
};

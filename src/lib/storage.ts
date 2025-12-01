import { Transaction, Category } from './types';

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

// API helper function
async function apiCall(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `API call failed: ${response.statusText}`);
    }

    return response.json();
}

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        return await apiCall('/transactions');
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction> => {
    try {
        return await apiCall('/transactions', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
};

export const updateTransaction = async (id: string, updatedTransaction: Transaction): Promise<Transaction> => {
    try {
        return await apiCall(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedTransaction),
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw error;
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {
    try {
        await apiCall(`/transactions/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
    try {
        return await apiCall('/categories');
    } catch (error) {
        console.error('Error fetching categories:', error);
        return DEFAULT_CATEGORIES;
    }
};

export const saveCategory = async (category: Category): Promise<Category> => {
    try {
        return await apiCall('/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
    } catch (error) {
        console.error('Error saving category:', error);
        throw error;
    }
};

export const updateCategory = async (id: string, updatedCategory: Category): Promise<Category> => {
    try {
        return await apiCall(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedCategory),
        });
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        await apiCall(`/categories/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
};

// Initialize storage (now creates default ledger if none exists)
export const initializeStorage = async (): Promise<void> => {
    // This is now handled by the database initialization
    // We'll keep this function for backward compatibility
};

export const clearAllData = async (): Promise<void> => {
    // Database operations require individual API calls
    // This would be a destructive operation, so we'll leave it for now
    console.warn('clearAllData is not implemented for database backend');
};

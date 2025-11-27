import { Transaction, Summary, CategoryTotal, FilterOptions } from './types';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export const calculateSummary = (transactions: Transaction[]): Summary => {
    const totalIncome = transactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length,
    };
};

export const groupByCategory = (
    transactions: Transaction[],
    categories: { name: string; color: string }[]
): CategoryTotal[] => {
    const grouped = transactions.reduce((acc, transaction) => {
        const existing = acc.find(item => item.category === transaction.category);
        if (existing) {
            existing.amount += transaction.amount;
        } else {
            const category = categories.find(c => c.name === transaction.category);
            acc.push({
                category: transaction.category,
                amount: transaction.amount,
                color: category?.color || '#999999',
            });
        }
        return acc;
    }, [] as CategoryTotal[]);

    return grouped.sort((a, b) => b.amount - a.amount);
};

export const filterTransactions = (
    transactions: Transaction[],
    filters: FilterOptions
): Transaction[] => {
    return transactions.filter(transaction => {
        // Date range filter
        if (filters.startDate && transaction.date < filters.startDate) return false;
        if (filters.endDate && transaction.date > filters.endDate) return false;

        // Category filter
        if (filters.category && transaction.category !== filters.category) return false;

        // Type filter
        if (filters.type && filters.type !== 'All' && transaction.type !== filters.type) return false;

        // Search query filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesDescription = transaction.description.toLowerCase().includes(query);
            const matchesCategory = transaction.category.toLowerCase().includes(query);
            if (!matchesDescription && !matchesCategory) return false;
        }

        return true;
    });
};

export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const sortTransactionsByDate = (
    transactions: Transaction[],
    order: 'asc' | 'desc' = 'desc'
): Transaction[] => {
    return [...transactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
};

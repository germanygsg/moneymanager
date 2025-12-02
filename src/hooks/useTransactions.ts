'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, Category, FilterOptions, Summary } from '@/lib/types';
import {
    getTransactions,
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories,
    saveCategory,
    updateCategory,
    deleteCategory,
    clearAllData,
} from '@/lib/storage';
import {
    calculateSummary,
    filterTransactions,
    sortTransactionsByDate,
    groupByCategory,
} from '@/lib/utils';
import { useLedger } from '@/contexts/LedgerContext';

export const useTransactions = () => {
    const { currentLedger } = useLedger();
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<FilterOptions>({ type: 'All' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data from database
    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [loadedTransactions, loadedCategories] = await Promise.all([
                getTransactions(),
                getCategories()
            ]);
            setAllTransactions(loadedTransactions);
            setAllCategories(loadedCategories);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize data on mount and when ledger changes
    useEffect(() => {
        loadData();

        // Listen for ledger changes
        const handleLedgerChange = () => {
            loadData();
        };

        window.addEventListener('ledgerChanged', handleLedgerChange);
        return () => {
            window.removeEventListener('ledgerChanged', handleLedgerChange);
        };
    }, [loadData]);

    // Add transaction
    const addTransaction = useCallback(async (transaction: Transaction) => {
        try {
            const newTransaction = await saveTransaction(transaction);
            setAllTransactions(prev => [newTransaction, ...prev]);
        } catch (err) {
            console.error('Error adding transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to add transaction');
            throw err;
        }
    }, []);

    // Update transaction
    const editTransaction = useCallback(async (id: string, transaction: Transaction) => {
        try {
            const updatedTransaction = await updateTransaction(id, transaction);
            setAllTransactions(prev =>
                prev.map(t => t.id === id ? updatedTransaction : t)
            );
        } catch (err) {
            console.error('Error updating transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to update transaction');
            throw err;
        }
    }, []);

    // Delete transaction
    const removeTransaction = useCallback(async (id: string) => {
        try {
            await deleteTransaction(id);
            setAllTransactions(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Error deleting transaction:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete transaction');
            throw err;
        }
    }, []);

    // Add category
    const addCategory = useCallback(async (category: Category) => {
        try {
            const newCategory = await saveCategory(category);
            setAllCategories(prev => [newCategory, ...prev]);
        } catch (err) {
            console.error('Error adding category:', err);
            setError(err instanceof Error ? err.message : 'Failed to add category');
            throw err;
        }
    }, []);

    // Update category
    const editCategory = useCallback(async (id: string, category: Category) => {
        try {
            const updatedCategory = await updateCategory(id, category);
            setAllCategories(prev =>
                prev.map(c => c.id === id ? updatedCategory : c)
            );
        } catch (err) {
            console.error('Error updating category:', err);
            setError(err instanceof Error ? err.message : 'Failed to update category');
            throw err;
        }
    }, []);

    // Delete category
    const removeCategory = useCallback(async (id: string) => {
        try {
            await deleteCategory(id);
            setAllCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete category');
            throw err;
        }
    }, []);

    // Update filters
    const updateFilters = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({ type: 'All' });
    }, []);

    // Refresh data
    const refreshData = useCallback(() => {
        loadData();
    }, [loadData]);

    // Clear all data
    const clearData = useCallback(async () => {
        try {
            await clearAllData();
            await loadData();
        } catch (err) {
            console.error('Error clearing data:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear data');
        }
    }, [loadData]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Filter data by current ledger
    const transactions = currentLedger
        ? allTransactions.filter(t => t.ledgerId === currentLedger.id)
        : allTransactions;

    const categories = currentLedger
        ? allCategories.filter(c => c.ledgerId === currentLedger.id)
        : allCategories;

    // Computed values
    const filteredTransactions = filterTransactions(transactions, filters);
    const sortedTransactions = sortTransactionsByDate(filteredTransactions);
    const summary: Summary = calculateSummary(transactions);
    const expensesByCategory = groupByCategory(
        transactions.filter(t => t.type === 'Expense'),
        categories
    );
    const incomeByCategory = groupByCategory(
        transactions.filter(t => t.type === 'Income'),
        categories
    );

    return {
        transactions: sortedTransactions,
        allTransactions: transactions,
        categories,
        filters,
        summary,
        expensesByCategory,
        incomeByCategory,
        isLoading,
        error,
        addTransaction,
        editTransaction,
        removeTransaction,
        addCategory,
        editCategory,
        removeCategory,
        updateFilters,
        clearFilters,
        clearData,
        refreshData,
        clearError,
    };
};

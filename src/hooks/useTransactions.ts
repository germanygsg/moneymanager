'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, Category, FilterOptions, Summary } from '@/lib/types';
import {
    getTransactions,
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    getCategories,
    initializeStorage,
} from '@/lib/storage';
import {
    calculateSummary,
    filterTransactions,
    sortTransactionsByDate,
    groupByCategory,
} from '@/lib/utils';

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<FilterOptions>({ type: 'All' });
    const [isLoading, setIsLoading] = useState(true);

    // Initialize data from localStorage
    useEffect(() => {
        initializeStorage();
        setTransactions(getTransactions());
        setCategories(getCategories());
        setIsLoading(false);
    }, []);

    // Add transaction
    const addTransaction = useCallback((transaction: Transaction) => {
        saveTransaction(transaction);
        setTransactions(getTransactions());
    }, []);

    // Update transaction
    const editTransaction = useCallback((id: string, transaction: Transaction) => {
        updateTransaction(id, transaction);
        setTransactions(getTransactions());
    }, []);

    // Delete transaction
    const removeTransaction = useCallback((id: string) => {
        deleteTransaction(id);
        setTransactions(getTransactions());
    }, []);

    // Update filters
    const updateFilters = useCallback((newFilters: FilterOptions) => {
        setFilters(newFilters);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({ type: 'All' });
    }, []);

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
        addTransaction,
        editTransaction,
        removeTransaction,
        updateFilters,
        clearFilters,
    };
};

import {
    formatCurrency,
    formatCompactNumber,
    formatDate,
    calculateSummary,
    groupByCategory,
    filterTransactions,
    generateId,
    sortTransactionsByDate,
} from '../utils';
import { Transaction, FilterOptions } from '../types';

// Sample data for tests
const createTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
    id: 'test-id',
    date: '2024-01-15',
    category: 'Food',
    description: 'Test transaction',
    amount: 100,
    type: 'Expense',
    ...overrides,
});

describe('formatCurrency', () => {
    it('should format positive amounts in IDR currency', () => {
        const result = formatCurrency(1000000);
        expect(result).toContain('1.000.000');
    });

    it('should format zero amount', () => {
        const result = formatCurrency(0);
        expect(result).toContain('0');
    });

    it('should format negative amounts', () => {
        const result = formatCurrency(-50000);
        expect(result).toContain('50.000');
    });

    it('should format large amounts', () => {
        const result = formatCurrency(1500000000);
        expect(result).toContain('1.500.000.000');
    });
});

describe('formatCompactNumber', () => {
    it('should format thousands with K suffix', () => {
        const result = formatCompactNumber(1500);
        expect(result).toBe('1.5K');
    });

    it('should format millions with M suffix', () => {
        const result = formatCompactNumber(2500000);
        expect(result).toBe('2.5M');
    });

    it('should format billions with B suffix', () => {
        const result = formatCompactNumber(1000000000);
        expect(result).toBe('1B');
    });

    it('should handle small numbers without suffix', () => {
        const result = formatCompactNumber(100);
        expect(result).toBe('100');
    });
});

describe('formatDate', () => {
    it('should format ISO date string to Indonesian format', () => {
        const result = formatDate('2024-01-15');
        expect(result).toContain('Jan');
        expect(result).toContain('2024');
    });

    it('should handle different months', () => {
        const result = formatDate('2024-12-25');
        expect(result).toContain('Des');
        expect(result).toContain('2024');
    });
});

describe('calculateSummary', () => {
    it('should return zero summary for empty transactions', () => {
        const result = calculateSummary([]);
        expect(result).toEqual({
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            transactionCount: 0,
        });
    });

    it('should calculate income only transactions', () => {
        const transactions = [
            createTransaction({ type: 'Income', amount: 1000 }),
            createTransaction({ type: 'Income', amount: 500 }),
        ];
        const result = calculateSummary(transactions);
        expect(result.totalIncome).toBe(1500);
        expect(result.totalExpense).toBe(0);
        expect(result.balance).toBe(1500);
    });

    it('should calculate expense only transactions', () => {
        const transactions = [
            createTransaction({ type: 'Expense', amount: 300 }),
            createTransaction({ type: 'Expense', amount: 200 }),
        ];
        const result = calculateSummary(transactions);
        expect(result.totalIncome).toBe(0);
        expect(result.totalExpense).toBe(500);
        expect(result.balance).toBe(-500);
    });

    it('should calculate mixed transactions correctly', () => {
        const transactions = [
            createTransaction({ type: 'Income', amount: 1000 }),
            createTransaction({ type: 'Expense', amount: 300 }),
            createTransaction({ type: 'Expense', amount: 200 }),
        ];
        const result = calculateSummary(transactions);
        expect(result.totalIncome).toBe(1000);
        expect(result.totalExpense).toBe(500);
        expect(result.balance).toBe(500);
        expect(result.transactionCount).toBe(3);
    });
});

describe('groupByCategory', () => {
    const categories = [
        { name: 'Food', color: '#FF0000' },
        { name: 'Transport', color: '#00FF00' },
    ];

    it('should group transactions by category', () => {
        const transactions = [
            createTransaction({ category: 'Food', amount: 100 }),
            createTransaction({ category: 'Food', amount: 50 }),
            createTransaction({ category: 'Transport', amount: 200 }),
        ];
        const result = groupByCategory(transactions, categories);
        expect(result).toHaveLength(2);
        expect(result.find(r => r.category === 'Food')?.amount).toBe(150);
        expect(result.find(r => r.category === 'Transport')?.amount).toBe(200);
    });

    it('should sort by amount descending', () => {
        const transactions = [
            createTransaction({ category: 'Food', amount: 100 }),
            createTransaction({ category: 'Transport', amount: 300 }),
        ];
        const result = groupByCategory(transactions, categories);
        expect(result[0].category).toBe('Transport');
        expect(result[1].category).toBe('Food');
    });

    it('should use fallback color for missing categories', () => {
        const transactions = [
            createTransaction({ category: 'Unknown', amount: 100 }),
        ];
        const result = groupByCategory(transactions, categories);
        expect(result[0].color).toBe('#999999');
    });
});

describe('filterTransactions', () => {
    const transactions = [
        createTransaction({ id: '1', date: '2024-01-10', category: 'Food', type: 'Expense', description: 'Lunch', amount: 50 }),
        createTransaction({ id: '2', date: '2024-01-15', category: 'Transport', type: 'Expense', description: 'Bus fare', amount: 20 }),
        createTransaction({ id: '3', date: '2024-01-20', category: 'Salary', type: 'Income', description: 'Monthly salary', amount: 5000 }),
    ];

    it('should return all transactions with no filters', () => {
        const result = filterTransactions(transactions, { type: 'All' });
        expect(result).toHaveLength(3);
    });

    it('should filter by date range', () => {
        const filters: FilterOptions = { startDate: '2024-01-12', endDate: '2024-01-18' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('2');
    });

    it('should filter by category', () => {
        const filters: FilterOptions = { category: 'Food' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Food');
    });

    it('should filter by type', () => {
        const filters: FilterOptions = { type: 'Income' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('Income');
    });

    it('should filter by search query in description', () => {
        const filters: FilterOptions = { searchQuery: 'lunch' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].description).toBe('Lunch');
    });

    it('should filter by search query in category', () => {
        const filters: FilterOptions = { searchQuery: 'transport' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Transport');
    });

    it('should filter by search query in amount', () => {
        const filters: FilterOptions = { searchQuery: '5000' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].amount).toBe(5000);
    });

    it('should apply multiple filters', () => {
        const filters: FilterOptions = { type: 'Expense', category: 'Food' };
        const result = filterTransactions(transactions, filters);
        expect(result).toHaveLength(1);
        expect(result[0].category).toBe('Food');
        expect(result[0].type).toBe('Expense');
    });
});

describe('generateId', () => {
    it('should generate a unique id', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });

    it('should include timestamp component', () => {
        const id = generateId();
        const parts = id.split('-');
        expect(parts.length).toBe(2);
        expect(Number(parts[0])).toBeGreaterThan(0);
    });

    it('should include random component', () => {
        const id = generateId();
        const parts = id.split('-');
        expect(parts[1].length).toBe(9);
    });
});

describe('sortTransactionsByDate', () => {
    const transactions = [
        createTransaction({ id: '1', date: '2024-01-15' }),
        createTransaction({ id: '2', date: '2024-01-10' }),
        createTransaction({ id: '3', date: '2024-01-20' }),
    ];

    it('should sort by date descending by default', () => {
        const result = sortTransactionsByDate(transactions);
        expect(result[0].id).toBe('3');
        expect(result[1].id).toBe('1');
        expect(result[2].id).toBe('2');
    });

    it('should sort by date ascending when specified', () => {
        const result = sortTransactionsByDate(transactions, 'asc');
        expect(result[0].id).toBe('2');
        expect(result[1].id).toBe('1');
        expect(result[2].id).toBe('3');
    });

    it('should not mutate the original array', () => {
        const original = [...transactions];
        sortTransactionsByDate(transactions, 'asc');
        expect(transactions).toEqual(original);
    });
});

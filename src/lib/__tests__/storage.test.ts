import { DEFAULT_CATEGORIES } from '../storage';

describe('DEFAULT_CATEGORIES', () => {
    it('should have all required properties for each category', () => {
        DEFAULT_CATEGORIES.forEach(category => {
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('name');
            expect(category).toHaveProperty('type');
            expect(category).toHaveProperty('color');
            expect(category).toHaveProperty('icon');
        });
    });

    it('should have unique ids', () => {
        const ids = DEFAULT_CATEGORIES.map(c => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid category types', () => {
        DEFAULT_CATEGORIES.forEach(category => {
            expect(['Income', 'Expense']).toContain(category.type);
        });
    });

    it('should have a mix of income and expense categories', () => {
        const incomeCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'Income');
        const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'Expense');

        expect(incomeCategories.length).toBeGreaterThan(0);
        expect(expenseCategories.length).toBeGreaterThan(0);
    });

    it('should have valid hex color codes', () => {
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        DEFAULT_CATEGORIES.forEach(category => {
            expect(category.color).toMatch(hexColorRegex);
        });
    });

    it('should include common expense categories', () => {
        const expenseNames = DEFAULT_CATEGORIES
            .filter(c => c.type === 'Expense')
            .map(c => c.name);

        expect(expenseNames).toContain('Food');
        expect(expenseNames).toContain('Transport');
        expect(expenseNames).toContain('Shopping');
    });

    it('should include common income categories', () => {
        const incomeNames = DEFAULT_CATEGORIES
            .filter(c => c.type === 'Income')
            .map(c => c.name);

        expect(incomeNames).toContain('Salary');
        expect(incomeNames).toContain('Business');
    });
});

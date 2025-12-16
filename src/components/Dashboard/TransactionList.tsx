'use client';

import React from 'react';
import { Box, Typography, Paper, alpha } from '@mui/material';
import { Transaction, Category } from '@/lib/types';
import TransactionCard from './TransactionCard';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/utils';
import { pastelColors } from '@/theme/theme';

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    title?: string;
    variant?: 'default' | 'compact';
}

export default function TransactionList({
    transactions,
    categories,
    onEdit,
    onDelete,
    title = "Recent Transactions",
    variant = 'default',
}: TransactionListProps) {
    const { formatCurrency } = useCurrency();

    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color || '#999999';
    };

    if (transactions.length === 0) {
        return (
            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    No transactions yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click &quot;Add Transaction&quot; to get started
                </Typography>
            </Paper>
        );
    }

    if (variant === 'compact') {
        return (
            <Box>
                {title && (
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        {title}
                    </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {transactions.map((transaction) => {
                        const isIncome = transaction.type === 'Income';
                        const categoryColor = getCategoryColor(transaction.category);

                        return (
                            <Box
                                key={transaction.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: categoryColor,
                                        flexShrink: 0
                                    }} />

                                    <Box sx={{ overflow: 'hidden' }}>
                                        <Typography variant="body2" fontWeight={600} noWrap>
                                            {transaction.category}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                                            {transaction.description || formatDate(transaction.date)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{
                                        color: isIncome ? pastelColors.mintDark : 'error.main',
                                        ml: 2,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {title && (
                <Typography variant="h6" gutterBottom fontWeight={600}>
                    {title}
                </Typography>
            )}
            {transactions.map((transaction) => (
                <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    categoryColor={getCategoryColor(transaction.category)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </Box>
    );
}

'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Transaction, Category } from '@/lib/types';
import TransactionCard from './TransactionCard';

interface TransactionListProps {
    transactions: Transaction[];
    categories: Category[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    title?: string;
}

export default function TransactionList({
    transactions,
    categories,
    onEdit,
    onDelete,
    title = "Recent Transactions",
}: TransactionListProps) {
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

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={600}>
                {title}
            </Typography>
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

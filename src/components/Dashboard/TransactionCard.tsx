'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface TransactionCardProps {
    transaction: Transaction;
    categoryColor?: string;
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}

export default function TransactionCard({
    transaction,
    categoryColor = '#999',
    onEdit,
    onDelete,
}: TransactionCardProps) {
    const isIncome = transaction.type === 'Income';

    return (
        <Card
            sx={{
                mb: 2,
                borderLeft: `4px solid ${categoryColor}`,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s',
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                label={transaction.category}
                                size="small"
                                sx={{
                                    bgcolor: categoryColor,
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                            <Chip
                                label={transaction.type}
                                size="small"
                                color={isIncome ? 'success' : 'error'}
                                variant="outlined"
                            />
                        </Box>

                        <Typography variant="body1" fontWeight={600} gutterBottom>
                            {transaction.description}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {formatDate(transaction.date)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: isIncome ? 'success.main' : 'error.main' }}
                        >
                            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </Typography>

                        <Box>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(transaction)}
                                sx={{ mr: 0.5 }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => onDelete(transaction.id)}
                                color="error"
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Summary } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OverviewCardsProps {
    summary: Summary;
}

export default function OverviewCards({ summary }: OverviewCardsProps) {
    const { formatCurrency } = useCurrency();

    const cards = [
        {
            title: 'Total Income',
            value: formatCurrency(summary.totalIncome),
            icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
            color: 'success.main',
            bgColor: 'success.light',
            bgOpacity: 0.1,
        },
        {
            title: 'Total Expense',
            value: formatCurrency(summary.totalExpense),
            icon: <TrendingDownIcon sx={{ fontSize: 40 }} />,
            color: 'error.main',
            bgColor: 'error.light',
            bgOpacity: 0.1,
        },
        {
            title: 'Balance',
            value: formatCurrency(summary.balance),
            icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
            color: 'primary.main',
            bgColor: 'primary.light',
            bgOpacity: 0.1,
        },
        {
            title: 'Transactions',
            value: summary.transactionCount.toString(),
            icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
            color: 'secondary.main',
            bgColor: 'secondary.light',
            bgOpacity: 0.1,
        },
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {cards.map((card, index) => (
                <Card
                    key={index}
                    sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${card.bgColor} 0%, transparent 100%)`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography color="text.secondary" variant="body2" gutterBottom>
                                    {card.title}
                                </Typography>
                                <Typography variant="h5" component="div" fontWeight={700} sx={{ color: card.color }}>
                                    {card.value}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    color: card.color,
                                    opacity: 0.8,
                                }}
                            >
                                {card.icon}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

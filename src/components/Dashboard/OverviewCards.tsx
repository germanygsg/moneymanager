'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Summary } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { pastelColors } from '@/theme/theme';

interface OverviewCardsProps {
    summary: Summary;
}

export default function OverviewCards({ summary }: OverviewCardsProps) {
    const { formatCurrency } = useCurrency();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';

    const cards = [
        {
            title: 'Total Income',
            value: formatCurrency(summary.totalIncome),
            icon: <TrendingUpIcon />,
            color: 'success.main',
            bgColor: isDark ? alpha(pastelColors.mint, 0.15) : pastelColors.mintLight,
            iconBg: isDark ? alpha(pastelColors.mint, 0.2) : pastelColors.mint,
            iconColor: isDark ? pastelColors.mint : pastelColors.sidebarDark,
        },
        {
            title: 'Total Expense',
            value: formatCurrency(-summary.totalExpense),
            icon: <TrendingDownIcon />,
            color: 'error.main',
            bgColor: isDark ? alpha(pastelColors.peach, 0.15) : pastelColors.peachLight,
            iconBg: isDark ? alpha(pastelColors.peach, 0.2) : pastelColors.peach,
            iconColor: isDark ? pastelColors.peach : pastelColors.sidebarDark,
        },
        {
            title: 'Balance',
            value: formatCurrency(summary.balance),
            icon: <AccountBalanceWalletIcon />,
            color: 'primary.main',
            bgColor: isDark ? alpha(pastelColors.lavender, 0.15) : pastelColors.lavenderLight,
            iconBg: isDark ? alpha(pastelColors.lavender, 0.2) : pastelColors.lavender,
            iconColor: isDark ? pastelColors.lavender : pastelColors.sidebarDark,
        },
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {cards.map((card, index) => (
                <Card
                    key={index}
                    sx={{
                        height: '100%',
                        background: card.bgColor,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
                        {/* Icon positioned top right */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: card.iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.iconColor,
                                '& svg': {
                                    fontSize: 24
                                }
                            }}
                        >
                            {card.icon}
                        </Box>

                        {/* Content stacked vertically */}
                        <Box>
                            <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    mb: 1,
                                }}
                            >
                                {card.title}
                            </Typography>
                            <Typography
                                variant="h5"
                                component="div"
                                fontWeight={700}
                                sx={{
                                    color: card.color,
                                    fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1.2,
                                }}
                            >
                                {card.value}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}

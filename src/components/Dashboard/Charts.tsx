'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { CategoryTotal } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ChartsProps {
    expensesByCategory: CategoryTotal[];
    incomeByCategory: CategoryTotal[];
    totalIncome: number;
    totalExpense: number;
}

export default function Charts({
    expensesByCategory,
    incomeByCategory,
    totalIncome,
    totalExpense,
}: ChartsProps) {
    const { formatCurrency } = useCurrency();

    const pieData = [
        { id: 0, value: totalIncome, label: 'Income', color: '#10b981' },
        { id: 1, value: totalExpense, label: 'Expense', color: '#ef4444' },
    ];

    const hasExpenses = expensesByCategory.length > 0;
    const hasIncome = incomeByCategory.length > 0;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Income vs Expense
                    </Typography>
                    {totalIncome > 0 || totalExpense > 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <PieChart
                                series={[{ data: pieData }]}
                                height={250}
                                width={400}
                            />
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No data available
                        </Typography>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Expenses by Category
                    </Typography>
                    {hasExpenses ? (
                        <Box sx={{ mt: 2 }}>
                            <BarChart
                                xAxis={[{ scaleType: 'band', data: expensesByCategory.map(c => c.category) }]}
                                series={[{ data: expensesByCategory.map(c => c.amount), color: '#ef4444' }]}
                                height={250}
                            />
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            No expense data available
                        </Typography>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Top Expenses
                    </Typography>
                    {hasExpenses ? (
                        <Box sx={{ mt: 2 }}>
                            {expensesByCategory.slice(0, 5).map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                                        <Typography variant="body2">{item.category}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {formatCurrency(item.amount)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No expense data available
                        </Typography>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                        Income Sources
                    </Typography>
                    {hasIncome ? (
                        <Box sx={{ mt: 2 }}>
                            {incomeByCategory.slice(0, 5).map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                                        <Typography variant="body2">{item.category}</Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {formatCurrency(item.amount)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No income data available
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

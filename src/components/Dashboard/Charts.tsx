'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, alpha, LinearProgress } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { CategoryTotal } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCompactNumber } from '@/lib/utils';
import { pastelColors } from '@/theme/theme';

interface ChartCardProps {
    title: string;
    headerColor: string;
    children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    headerColor,
    children
}) => (
    <Card sx={{ height: '100%' }}>
        <Box
            sx={{
                height: 6,
                background: `linear-gradient(90deg, ${headerColor} 0%, ${alpha(headerColor, 0.3)} 100%)`,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
            }}
        />
        <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, fontSize: '1rem' }}>
                {title}
            </Typography>
            {children}
        </CardContent>
    </Card>
);

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
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';

    const pieData = [
        { id: 0, value: totalIncome, label: 'Income', color: pastelColors.mint },
        { id: 1, value: totalExpense, label: 'Expense', color: pastelColors.peach },
    ];

    const hasExpenses = expensesByCategory.length > 0;
    const hasIncome = incomeByCategory.length > 0;

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            <ChartCard title="Income vs Expense" headerColor={pastelColors.lavender}>
                {totalIncome > 0 || totalExpense > 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <PieChart
                            series={[{
                                data: pieData,
                                innerRadius: 40,
                                outerRadius: 80,
                                paddingAngle: 3,
                                cornerRadius: 5,
                                highlightScope: { fade: 'global', highlight: 'item' },
                            }]}
                            height={250}
                            slotProps={{
                                legend: {
                                    position: { vertical: 'bottom', horizontal: 'center' },
                                },
                            }}
                            margin={{ top: 10, bottom: 60, left: 10, right: 10 }}
                        />
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafbfc',
                        borderRadius: 2,
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No data available
                        </Typography>
                    </Box>
                )}
            </ChartCard>

            <ChartCard title="Expenses by Category" headerColor={pastelColors.peach}>
                {hasExpenses ? (
                    <Box sx={{ mt: 2 }}>
                        <BarChart
                            xAxis={[{
                                scaleType: 'band',
                                data: expensesByCategory.map(c => c.category),
                                tickLabelStyle: {
                                    fontSize: 11,
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }]}
                            series={[{
                                data: expensesByCategory.map(c => c.amount),
                                color: pastelColors.peach,
                                valueFormatter: (v: number | null) => formatCompactNumber(v ?? 0)
                            }]}
                            yAxis={[{
                                valueFormatter: (v: number) => formatCompactNumber(v),
                                tickLabelStyle: {
                                    fontSize: 11,
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }]}
                            height={250}
                            borderRadius={8}
                        />
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafbfc',
                        borderRadius: 2,
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No expense data available
                        </Typography>
                    </Box>
                )}
            </ChartCard>

            <ChartCard title="Top Expenses" headerColor={pastelColors.yellow}>
                {hasExpenses ? (
                    <Box sx={{ mt: 1 }}>
                        {expensesByCategory.slice(0, 5).map((item, index) => {
                            const maxAmount = Math.max(...expensesByCategory.map(c => c.amount));
                            const percentage = (item.amount / maxAmount) * 100;
                            return (
                                <Box key={index} sx={{ mb: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: 1,
                                                    bgcolor: item.color || pastelColors.peach,
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                                                {item.category}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                                            {formatCurrency(item.amount)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 3,
                                                bgcolor: item.color || pastelColors.peach,
                                            },
                                        }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafbfc',
                        borderRadius: 2,
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No expense data available
                        </Typography>
                    </Box>
                )}
            </ChartCard>

            <ChartCard title="Income by Category" headerColor={pastelColors.mint}>
                {hasIncome ? (
                    <Box sx={{ mt: 2 }}>
                        <BarChart
                            xAxis={[{
                                scaleType: 'band',
                                data: incomeByCategory.map(c => c.category),
                                tickLabelStyle: {
                                    fontSize: 11,
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }]}
                            series={[{
                                data: incomeByCategory.map(c => c.amount),
                                color: pastelColors.mint,
                                valueFormatter: (v: number | null) => formatCompactNumber(v ?? 0)
                            }]}
                            yAxis={[{
                                valueFormatter: (v: number) => formatCompactNumber(v),
                                tickLabelStyle: {
                                    fontSize: 11,
                                    fontFamily: 'Inter, sans-serif',
                                },
                            }]}
                            height={250}
                            borderRadius={8}
                        />
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#fafbfc',
                        borderRadius: 2,
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No income data available
                        </Typography>
                    </Box>
                )}
            </ChartCard>
        </Box>
    );
}

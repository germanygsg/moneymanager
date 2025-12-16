'use client';

import React, { useState, useMemo } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Divider,
    useTheme,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Layout from '@/components/Layout/Layout';
import { useTransactions } from '@/hooks/useTransactions';
import { useLedger } from '@/contexts/LedgerContext';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { format, subMonths, isBefore, isAfter, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';


// Helper to get cycle date range for a given reference date and start day
const getCycleRange = (referenceDate: Date, startDay: number) => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    // If reference day is before startDay, then it belongs to previous cycle period
    // e.g. ref=Nov 5, start=25. Period is Oct 25 - Nov 24.
    // e.g. ref=Nov 27, start=25. Period is Nov 25 - Dec 24.

    let cycleStartDate: Date;
    if (referenceDate.getDate() < startDay) {
        cycleStartDate = new Date(year, month - 1, startDay);
    } else {
        cycleStartDate = new Date(year, month, startDay);
    }

    const cycleEndDate = new Date(cycleStartDate);
    cycleEndDate.setMonth(cycleEndDate.getMonth() + 1);
    cycleEndDate.setDate(cycleEndDate.getDate() - 1); // Day before next start

    return { start: startOfDay(cycleStartDate), end: endOfDay(cycleEndDate) };
};

// Helper to get last N cycles
const getLastNCycles = (referenceDate: Date, startDay: number, n: number) => {
    const cycles = [];
    let currentRef = referenceDate;

    for (let i = 0; i < n; i++) {
        const range = getCycleRange(currentRef, startDay);
        cycles.push(range);
        // Move ref to before this cycle
        currentRef = new Date(range.start);
        currentRef.setDate(currentRef.getDate() - 1);
    }

    return cycles.reverse(); // Oldest first
};

export default function ReportsPage() {
    const theme = useTheme();
    const { allTransactions, isLoading } = useTransactions();
    const { currentLedger } = useLedger();
    const [cycleStartDay, setCycleStartDay] = useState<number>(1);
    const [periodSelection, setPeriodSelection] = useState<'this' | 'last' | 'last3'>('this');
    const [openCycleDialog, setOpenCycleDialog] = useState(false);
    const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null);



    // Helper for formatting currency
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currentLedger?.currency || 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Compact number formatter (e.g. 1.2M, 3.5k)
    const formatCompact = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(value);
    };

    // Generate days 1-31 for select
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // --- Chart Data Calculation (Standard 12 Months) ---
    const chartData = useMemo(() => {
        if (!allTransactions.length) return [];

        const today = new Date();
        const last12MonthsData = [];

        let currentRef = today;
        for (let i = 0; i < 12; i++) {
            // Use standard calendar month
            const monthStart = startOfMonth(currentRef);
            const monthEnd = endOfMonth(currentRef);
            const label = format(monthStart, 'MMM');

            // Filter transactions
            const txs = allTransactions.filter(t => {
                const d = new Date(t.date);
                return (isAfter(d, monthStart) || d.getTime() === monthStart.getTime()) &&
                    (isBefore(d, monthEnd) || d.getTime() === monthEnd.getTime());
            });

            const inc = txs.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
            const exp = txs.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

            last12MonthsData.push({ label, income: inc, expense: exp });

            // Move back to previous month
            currentRef = subMonths(currentRef, 1);
        }

        return last12MonthsData.reverse();
    }, [allTransactions]); // Removed cycleStartDay dependency

    // Apply zoom filter to chart data
    const visibleChartData = useMemo(() => {
        if (!zoomRange) return chartData;
        return chartData.slice(zoomRange.start, zoomRange.end);
    }, [chartData, zoomRange]);

    // --- Period Summary Calculation ---
    const summaryData = useMemo(() => {
        const today = new Date();
        let ranges: { start: Date, end: Date }[] = [];

        if (periodSelection === 'this') {
            ranges = [getCycleRange(today, cycleStartDay)];
        } else if (periodSelection === 'last') {
            const currentRange = getCycleRange(today, cycleStartDay);
            const prevRef = new Date(currentRange.start);
            prevRef.setDate(prevRef.getDate() - 1);
            ranges = [getCycleRange(prevRef, cycleStartDay)];
        } else if (periodSelection === 'last3') {
            ranges = getLastNCycles(today, cycleStartDay, 3);
        }

        let totalIncome = 0;
        let totalExpense = 0;

        if (ranges.length === 0) return { income: 0, expense: 0, balance: 0 };

        const start = ranges[0].start; // Oldest (since getLastNCycles reverses)
        const end = ranges[ranges.length - 1].end;

        allTransactions.forEach(t => {
            const d = new Date(t.date);
            // Simple check within overall range
            if ((isAfter(d, start) || d.getTime() === start.getTime()) &&
                (isBefore(d, end) || d.getTime() === end.getTime())) {
                if (t.type === 'Income') totalIncome += t.amount;
                if (t.type === 'Expense') totalExpense += t.amount;
            }
        });

        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        };
    }, [allTransactions, cycleStartDay, periodSelection]);


    if (isLoading) {
        return (
            <Layout onAddTransaction={() => { }} showAddButton={false}>
                <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Container>
            </Layout>
        );
    }

    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
                    Reports
                </Typography>

                <Stack spacing={4}>
                    {/* Charts Card */}
                    <Card elevation={0} sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
                        backdropFilter: 'blur(24px)',
                    }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Annual Overview
                            </Typography>
                            <Box>
                                <Box sx={{ width: '100%', height: 400, mb: 2 }}>
                                    <LineChart
                                        dataset={visibleChartData}
                                        xAxis={[{
                                            scaleType: 'point',
                                            dataKey: 'label',
                                        }]}
                                        series={[
                                            {
                                                dataKey: 'income',
                                                label: 'Income',
                                                color: theme.palette.success.main,
                                                valueFormatter: (v) => v === null ? '' : formatMoney(v)
                                            },
                                            {
                                                dataKey: 'expense',
                                                label: 'Expense',
                                                color: theme.palette.error.main,
                                                valueFormatter: (v) => v === null ? '' : formatMoney(v)
                                            }
                                        ]}
                                        yAxis={[{
                                            valueFormatter: formatCompact,
                                        }]}
                                        grid={{ horizontal: true }}
                                        slotProps={{ legend: {} }}
                                        sx={{
                                            '& .MuiChartsLegend-root': {
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Zoom Controls */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setZoomRange({ start: 0, end: 3 })}
                                        disabled={chartData.length <= 3}
                                    >
                                        3M
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setZoomRange({ start: 0, end: 6 })}
                                        disabled={chartData.length <= 6}
                                    >
                                        6M
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setZoomRange({ start: 0, end: 12 })}
                                        disabled={zoomRange?.end === 12 && zoomRange?.start === 0}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => setZoomRange(null)}
                                        disabled={!zoomRange}
                                    >
                                        Reset
                                    </Button>
                                    {zoomRange && (
                                        <Typography variant="caption" color="text.secondary">
                                            Showing {chartData.slice(zoomRange.start, zoomRange.end).map(d => d.label).join(', ')}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Cycle Selection Card */}
                    <Card elevation={0} sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Report Settings
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Affects Period Summary calculation
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Typography variant="body2" color="text.secondary">
                                        Cycle Start: <b>Day {cycleStartDay}</b>
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setOpenCycleDialog(true)}
                                        size="small"
                                    >
                                        Change Cycle
                                    </Button>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Cycle Picker Dialog */}
                    <Dialog open={openCycleDialog} onClose={() => setOpenCycleDialog(false)}>
                        <DialogTitle>Select Cycle Start Day</DialogTitle>
                        <DialogContent>
                            <Box sx={{ width: '100%', pt: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                                    Select the day of the month when your financial cycle begins.
                                </Typography>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(7, 1fr)',
                                    gap: 1
                                }}>
                                    {days.map((day) => (
                                        <Button
                                            key={day}
                                            variant={cycleStartDay === day ? "contained" : "outlined"}
                                            color={cycleStartDay === day ? "primary" : "inherit"}
                                            size="small"
                                            onClick={() => {
                                                setCycleStartDay(day);
                                                setOpenCycleDialog(false);
                                            }}
                                            sx={{
                                                minWidth: 0,
                                                p: 0,
                                                height: 36,
                                                borderRadius: 2,
                                                borderColor: cycleStartDay === day ? 'primary.main' : 'divider'
                                            }}
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        </DialogContent>
                    </Dialog>

                    {/* Period Summary Card */}
                    <Card elevation={0} sx={{
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider',
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.background.paper, 1)})`
                            : `linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.background.paper, 1)})`
                    }}>
                        <CardContent>
                            <Stack spacing={4} alignItems="center">
                                {/* Toggle Buttons in Center */}
                                <ToggleButtonGroup
                                    color="primary"
                                    value={periodSelection}
                                    exclusive
                                    onChange={(e, newVal) => { if (newVal) setPeriodSelection(newVal); }}
                                    size="small"
                                    aria-label="period selection"
                                >
                                    <ToggleButton value="this">This Month</ToggleButton>
                                    <ToggleButton value="last">Last Month</ToggleButton>
                                    <ToggleButton value="last3">Last 3 Months</ToggleButton>
                                </ToggleButtonGroup>

                                {/* Balance Center Top */}
                                <Box textAlign="center">
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Balance</Typography>
                                    <Typography variant="h3" color={summaryData.balance >= 0 ? 'primary.main' : 'error.main'} fontWeight="bold">
                                        {formatMoney(summaryData.balance)}
                                    </Typography>
                                </Box>

                                {/* Income and Expenses Row */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', gap: 4, textAlign: 'center' }}>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">Income</Typography>
                                        <Typography variant="h5" color="success.main" fontWeight="bold">
                                            {formatMoney(summaryData.income)}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="overline" color="text.secondary" fontWeight="bold">Expenses</Typography>
                                        <Typography variant="h5" color="error.main" fontWeight="bold">
                                            {formatMoney(summaryData.expense)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ width: '100%' }} />

                                {/* Expenses Ratio Pie Chart */}
                                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        Expenses Ratio
                                    </Typography>
                                    <Box sx={{ height: 250, width: '100%' }}>
                                        <PieChart
                                            series={[
                                                {
                                                    data: [
                                                        { id: 0, value: summaryData.expense, label: 'Expenses', color: theme.palette.error.main },
                                                        { id: 1, value: Math.max(0, summaryData.income - summaryData.expense), label: 'Remaining', color: theme.palette.success.light },
                                                    ],
                                                    highlightScope: { fade: 'global', highlight: 'item' },
                                                    innerRadius: 60,
                                                    paddingAngle: 2,
                                                    cornerRadius: 4,
                                                    arcLabel: (item) => {
                                                        const total = summaryData.income > 0 ? summaryData.income : (summaryData.expense > 0 ? summaryData.expense : 1);
                                                        const percent = (item.value / total) * 100;
                                                        return percent > 5 ? `${percent.toFixed(0)}%` : '';
                                                    },
                                                    arcLabelMinAngle: 20,
                                                }
                                            ]}
                                        />
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Container>
        </Layout>
    );
}

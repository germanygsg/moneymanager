'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Transaction } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { pastelColors } from '@/theme/theme';

interface TransactionCardProps {
    transaction: Transaction;
    categoryColor?: string;
    onEdit?: (transaction: Transaction) => void;
    onDelete?: (id: string) => void;
}

export default function TransactionCard({
    transaction,
    categoryColor = '#999',
    onEdit,
    onDelete,
}: TransactionCardProps) {
    const { formatCurrency } = useCurrency();
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';
    const isIncome = transaction.type === 'Income';
    const hasReceipt = !!transaction.receiptImage;
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

    return (
        <>
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
                                        bgcolor: isDark ? alpha(categoryColor, 0.2) : categoryColor,
                                        color: isDark ? categoryColor : 'white',
                                        fontWeight: 600,
                                        border: isDark ? `1px solid ${categoryColor}` : 'none',
                                    }}
                                />
                                <Chip
                                    label={transaction.type}
                                    size="small"
                                    sx={{
                                        bgcolor: isIncome
                                            ? (isDark ? alpha(pastelColors.mint, 0.15) : pastelColors.mintLight)
                                            : (isDark ? alpha(pastelColors.peach, 0.15) : pastelColors.peachLight),
                                        color: isIncome ? pastelColors.mintDark : pastelColors.peachDark,
                                        fontWeight: 500,
                                        border: `1px solid ${isIncome ? pastelColors.mint : pastelColors.peach}`,
                                    }}
                                />
                                {hasReceipt && (
                                    <Chip
                                        icon={<ReceiptIcon sx={{ fontSize: 14 }} />}
                                        label="Receipt"
                                        size="small"
                                        sx={{
                                            height: 24,
                                            bgcolor: isDark ? alpha(pastelColors.sky, 0.15) : pastelColors.skyLight,
                                            color: pastelColors.skyDark,
                                            border: `1px solid ${pastelColors.sky}`,
                                            '& .MuiChip-icon': {
                                                color: pastelColors.skyDark,
                                            },
                                        }}
                                    />
                                )}
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
                                sx={{ color: isIncome ? pastelColors.mintDark : 'error.main' }}
                            >
                                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                            </Typography>

                            <Box>
                                <Tooltip title={hasReceipt ? "View Receipt" : "No receipt attached"}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => setReceiptDialogOpen(true)}
                                            disabled={!hasReceipt}
                                            sx={{
                                                mr: 0.5,
                                                color: pastelColors.skyDark,
                                                '&:hover': {
                                                    bgcolor: isDark ? alpha(pastelColors.sky, 0.1) : pastelColors.skyLight,
                                                },
                                            }}
                                        >
                                            <ReceiptIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                {onEdit && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(transaction)}
                                        sx={{
                                            mr: 0.5,
                                            '&:hover': {
                                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f8',
                                            },
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                )}
                                {onDelete && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(transaction.id)}
                                        sx={{
                                            color: 'error.main',
                                            '&:hover': {
                                                bgcolor: isDark ? alpha(pastelColors.blush, 0.15) : pastelColors.blushLight,
                                            },
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Receipt View Dialog - UNCHANGED FUNCTIONALITY */}
            <Dialog
                open={receiptDialogOpen}
                onClose={() => setReceiptDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    Receipt - {transaction.description}
                </DialogTitle>
                <DialogContent>
                    {transaction.receiptImage && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 2,
                            }}
                        >
                            <Box
                                component="img"
                                src={transaction.receiptImage}
                                alt="Receipt"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    boxShadow: 2,
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

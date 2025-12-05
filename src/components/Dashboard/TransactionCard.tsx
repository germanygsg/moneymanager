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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Transaction } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

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
    const { formatCurrency } = useCurrency();
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
                                {hasReceipt && (
                                    <Chip
                                        icon={<ReceiptIcon sx={{ fontSize: 14 }} />}
                                        label="Receipt"
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ height: 24 }}
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
                                sx={{ color: isIncome ? 'success.main' : 'error.main' }}
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
                                            sx={{ mr: 0.5 }}
                                            color="info"
                                        >
                                            <ReceiptIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
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

            {/* Receipt View Dialog */}
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


'use client';

import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Box,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transaction, Category } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

const transactionSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['Income', 'Expense']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (transaction: Transaction) => void;
    categories: Category[];
    editTransaction?: Transaction | null;
}

export default function TransactionForm({
    open,
    onClose,
    onSubmit,
    categories,
    editTransaction,
}: TransactionFormProps) {
    const { currency } = useCurrency();
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            categoryId: '',
            description: '',
            amount: 0,
            type: 'Expense',
        },
    });

    const selectedType = useWatch({
        control,
        name: 'type',
    });

    // Filter categories by type
    const filteredCategories = categories.filter(c => c.type === selectedType);

    // Reset form when dialog opens/closes or edit transaction changes
    useEffect(() => {
        if (editTransaction) {
            reset({
                date: editTransaction.date,
                categoryId: editTransaction.category,
                description: editTransaction.description,
                amount: editTransaction.amount,
                type: editTransaction.type,
            });
        } else {
            reset({
                date: new Date().toISOString().split('T')[0],
                categoryId: '',
                description: '',
                amount: 0,
                type: 'Expense',
            });
        }
    }, [editTransaction, reset, open]);

    const handleFormSubmit = (data: TransactionFormData) => {
        const transaction: Transaction = {
            id: editTransaction?.id || generateId(),
            date: data.date,
            category: data.categoryId,
            description: data.description,
            amount: data.amount,
            type: data.type,
        };
        onSubmit(transaction);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select {...field} label="Type">
                                        <MenuItem value="Income">Income</MenuItem>
                                        <MenuItem value="Expense">Expense</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />

                        <Controller
                            name="date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.date}
                                    helperText={errors.date?.message}
                                />
                            )}
                        />

                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <FormControl fullWidth error={!!errors.categoryId}>
                                    <InputLabel>Category</InputLabel>
                                    <Select {...field} label="Category">
                                        {filteredCategories.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.categoryId && (
                                        <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                                            {errors.categoryId.message}
                                        </Box>
                                    )}
                                </FormControl>
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={2}
                                    error={!!errors.description}
                                    helperText={errors.description?.message}
                                />
                            )}
                        />

                        <Controller
                            name="amount"
                            control={control}
                            render={({ field: { onChange, value, ...field } }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Amount"
                                    type="number"
                                    value={value || ''}
                                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                                    error={!!errors.amount}
                                    helperText={errors.amount?.message}
                                    InputProps={{
                                        startAdornment: <Box sx={{ mr: 1 }}>{currency.symbol}</Box>,
                                    }}
                                />
                            )}
                        />

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {editTransaction ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

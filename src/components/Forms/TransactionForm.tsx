'use client';

import React, { useEffect, useState, useRef } from 'react';
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
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transaction, Category } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLedger } from '@/contexts/LedgerContext';
import { compressImage, formatFileSize, getBase64Size, isValidImageFile } from '@/lib/imageCompression';

const transactionSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    amount: z.number().positive('Amount must be positive'),
    type: z.enum(['Income', 'Expense']),
    note: z.string().optional(),
    ledgerId: z.string().optional(),
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
    const { currentLedger } = useLedger();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

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
            note: '',
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
                categoryId: editTransaction.categoryId || editTransaction.category,
                description: editTransaction.description,
                amount: editTransaction.amount,
                type: editTransaction.type,
                note: editTransaction.note || '',
                ledgerId: editTransaction.ledgerId,
            });
            setReceiptImage(editTransaction.receiptImage || null);
        } else {
            reset({
                date: new Date().toISOString().split('T')[0],
                categoryId: '',
                description: '',
                amount: 0,
                type: 'Expense',
                note: '',
                ledgerId: currentLedger?.id,
            });
            setReceiptImage(null);
        }
        setImageError(null);
    }, [editTransaction, reset, open, currentLedger?.id]);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!isValidImageFile(file)) {
            setImageError('Please select a valid image file (JPEG, PNG, or WebP)');
            return;
        }

        // Validate file size (max 10MB before compression)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setImageError('Image file is too large. Maximum size is 10MB.');
            return;
        }

        setIsCompressing(true);
        setImageError(null);

        try {
            // Compress the image
            const compressedImage = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.7,
                outputFormat: 'image/jpeg',
            });

            setReceiptImage(compressedImage);
        } catch (error) {
            console.error('Error compressing image:', error);
            setImageError('Failed to process image. Please try another file.');
        } finally {
            setIsCompressing(false);
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = () => {
        setReceiptImage(null);
        setImageError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = async (event: React.ClipboardEvent) => {
        const items = event.clipboardData.items;
        let file: File | null = null;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break;
            }
        }

        if (!file) return;

        // Prevent default paste behavior if image is found
        // event.preventDefault(); // Don't prevent default, user might be pasting text into inputs

        if (!isValidImageFile(file)) {
            setImageError('Pasted content is not a valid image.');
            return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setImageError('Pasted image is too large. Maximum size is 10MB.');
            return;
        }

        setIsCompressing(true);
        setImageError(null);

        try {
            const compressedImage = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.7,
                outputFormat: 'image/jpeg',
            });
            setReceiptImage(compressedImage);
        } catch (error) {
            console.error('Error compressing pasted image:', error);
            setImageError('Failed to process pasted image.');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleFormSubmit = (data: TransactionFormData) => {
        const transaction: any = {
            id: editTransaction?.id || generateId(),
            date: data.date,
            description: data.description,
            amount: data.amount,
            type: data.type,
            note: data.note || '',
            categoryId: data.categoryId,
            ledgerId: data.ledgerId || currentLedger?.id,
            receiptImage: receiptImage || undefined,
        };
        onSubmit(transaction);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth onPaste={handlePaste}>
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

                        <Controller
                            name="note"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Note (Optional)"
                                    multiline
                                    rows={2}
                                    error={!!errors.note}
                                    helperText={errors.note?.message}
                                />
                            )}
                        />

                        {/* Receipt Image Upload Section */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                Receipt Image (Optional)
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                id="receipt-upload"
                            />

                            {!receiptImage ? (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        cursor: isCompressing ? 'wait' : 'pointer',
                                        borderStyle: 'dashed',
                                        borderColor: imageError ? 'error.main' : 'divider',
                                        backgroundColor: 'action.hover',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            backgroundColor: 'action.selected',
                                        },
                                    }}
                                    onClick={() => !isCompressing && fileInputRef.current?.click()}
                                >
                                    {isCompressing ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={32} />
                                            <Typography variant="body2" color="text.secondary">
                                                Compressing image...
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <UploadIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Click to upload or <strong>Paste</strong> image here
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                JPEG, PNG, WebP (max 10MB)
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            ) : (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        position: 'relative',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box
                                            component="img"
                                            src={receiptImage}
                                            alt="Receipt preview"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <ReceiptIcon fontSize="small" color="primary" />
                                                <Typography variant="body2" fontWeight={500}>
                                                    Receipt Attached
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Compressed size: {formatFileSize(getBase64Size(receiptImage))}
                                            </Typography>
                                            <Button
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={handleRemoveImage}
                                                color="error"
                                                sx={{ mt: 1 }}
                                            >
                                                Remove
                                            </Button>
                                        </Box>
                                    </Box>
                                </Paper>
                            )}

                            {imageError && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                                    {imageError}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={isCompressing}>
                        {editTransaction ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

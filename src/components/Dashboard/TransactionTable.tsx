'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Tooltip,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    useTheme,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Transaction, Category } from '@/lib/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatDate } from '@/lib/utils';
import { pastelColors } from '@/theme/theme';

interface TransactionTableProps {
    transactions: Transaction[];
    categories: Category[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}

export type ColumnId = 'date' | 'category' | 'description' | 'type' | 'amount';

export interface ColumnConfig {
    id: ColumnId;
    label: string;
    minWidth?: number;
    align?: 'left' | 'right' | 'center';
}

export const ALL_COLUMNS: ColumnConfig[] = [
    { id: 'date', label: 'Date', minWidth: 100 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'description', label: 'Description', minWidth: 150 },
    { id: 'type', label: 'Type', minWidth: 80 },
    { id: 'amount', label: 'Amount', minWidth: 100, align: 'right' },
];

interface TransactionTableProps {
    transactions: Transaction[];
    categories: Category[];
    visibleColumns: ColumnId[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
}

export default function TransactionTable({
    transactions,
    categories,
    visibleColumns,
    onEdit,
    onDelete,
}: TransactionTableProps) {
    const { formatCurrency } = useCurrency();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const textColor = isDark ? '#ffffff' : '#000000';

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Receipt Dialog State
    const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<{ src: string, desc: string } | null>(null);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getCategoryColor = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color || '#999999';
    };

    const handleViewReceipt = (image: string, desc: string) => {
        setSelectedReceipt({ src: image, desc });
        setReceiptDialogOpen(true);
    };

    const handleCloseReceipt = () => {
        setReceiptDialogOpen(false);
        setSelectedReceipt(null);
    };

    // Calculate displayed transactions
    const displayedTransactions = useMemo(() => {
        return transactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [transactions, page, rowsPerPage]);

    if (transactions.length === 0) {
        return (
            <Paper
                sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    No transactions found
                </Typography>
            </Paper>
        );
    }

    const isColumnVisible = (id: ColumnId) => visibleColumns.includes(id);

    return (
        <Paper sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
                <Table stickyHeader size="small" aria-label="transactions table">
                    <TableHead>
                        <TableRow>
                            {ALL_COLUMNS.map((column) => (
                                isColumnVisible(column.id) && (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : alpha('#ffffff', 0.9),
                                            color: textColor,
                                            py: 1.5,
                                            top: 0,
                                            zIndex: 5,
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                )
                            ))}
                            <TableCell
                                align="right"
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: isDark ? alpha(theme.palette.background.paper, 0.9) : alpha('#ffffff', 0.9),
                                    color: textColor,
                                    whiteSpace: 'nowrap',
                                    py: 1.5,
                                    top: 0, // Stick to the top of the TableContainer
                                    zIndex: 5,
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedTransactions.map((transaction) => {
                            const isIncome = transaction.type === 'Income';
                            const categoryColor = getCategoryColor(transaction.category);
                            const hasReceipt = !!transaction.receiptImage;

                            return (
                                <TableRow
                                    key={transaction.id}
                                    hover
                                    onClick={() => onEdit(transaction)}
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.2s',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {isColumnVisible('date') && (
                                        <TableCell sx={{ whiteSpace: 'nowrap', py: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: textColor }}>
                                                {formatDate(transaction.date)}
                                            </Typography>
                                        </TableCell>
                                    )}

                                    {isColumnVisible('category') && (
                                        <TableCell sx={{ py: 0.5 }}>
                                            <Chip
                                                label={transaction.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(categoryColor, 0.15),
                                                    color: categoryColor,
                                                    fontWeight: 600,
                                                    borderColor: alpha(categoryColor, 0.3),
                                                    borderWidth: 1,
                                                    borderStyle: 'solid',
                                                    height: 24,
                                                    fontSize: '0.75rem',
                                                    '& .MuiChip-label': { px: 1 }
                                                }}
                                            />
                                        </TableCell>
                                    )}

                                    {isColumnVisible('description') && (
                                        <TableCell sx={{ maxWidth: 300, py: 0.5 }}>
                                            <Typography variant="body2" sx={{ color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {transaction.description || '-'}
                                            </Typography>
                                        </TableCell>
                                    )}

                                    {isColumnVisible('type') && (
                                        <TableCell sx={{ py: 0.5 }}>
                                            <Chip
                                                label={transaction.type}
                                                size="small"
                                                sx={{
                                                    bgcolor: isIncome
                                                        ? alpha(pastelColors.mint, 0.15)
                                                        : alpha(pastelColors.peach, 0.15),
                                                    color: isIncome ? pastelColors.mintDark : pastelColors.peachDark,
                                                    fontWeight: 500,
                                                    height: 24,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </TableCell>
                                    )}

                                    {isColumnVisible('amount') && (
                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: isIncome ? pastelColors.mintDark : 'error.main'
                                                }}
                                            >
                                                {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                                            </Typography>
                                        </TableCell>
                                    )}

                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap', py: 0.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                            {hasReceipt && (
                                                <Tooltip title="View Receipt">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewReceipt(transaction.receiptImage!, transaction.description);
                                                        }}
                                                        sx={{ color: pastelColors.skyDark, width: 28, height: 28 }}
                                                    >
                                                        <ReceiptIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(transaction);
                                                    }}
                                                    sx={{
                                                        color: theme.palette.text.secondary,
                                                        '&:hover': { color: theme.palette.primary.main },
                                                        width: 28, height: 28
                                                    }}
                                                >
                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(transaction.id);
                                                    }}
                                                    sx={{
                                                        color: theme.palette.text.secondary,
                                                        '&:hover': { color: theme.palette.error.main },
                                                        width: 28, height: 28
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[25, 50, 75, 100]}
                component="div"
                count={transactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Receipt Dialog */}
            <Dialog
                open={receiptDialogOpen}
                onClose={handleCloseReceipt}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    Receipt - {selectedReceipt?.desc}
                </DialogTitle>
                <DialogContent>
                    {selectedReceipt && (
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
                                src={selectedReceipt.src}
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
                    <Button onClick={handleCloseReceipt}>Close</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

'use client';

import React, { useState, useMemo } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import Layout from '@/components/Layout/Layout';
import TransactionList from '@/components/Dashboard/TransactionList';
import TransactionForm from '@/components/Forms/TransactionForm';
import ConfirmDialog from '@/components/Common/ConfirmDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/lib/types';

type SortOrder = 'newest' | 'oldest';

export default function TransactionsPage() {
    const {
        transactions,
        categories,
        addTransaction,
        editTransaction,
        removeTransaction,
    } = useTransactions();

    const [formOpen, setFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    // Sort transactions by date
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) {
                return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
            }
            // Secondary sort by creation time if dates are equal
            const createdA = new Date(a.createdAt || 0).getTime();
            const createdB = new Date(b.createdAt || 0).getTime();
            return sortOrder === 'newest' ? createdB - createdA : createdA - createdB;
        });
    }, [transactions, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const handleOpenForm = () => {
        setEditingTransaction(null);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingTransaction(null);
    };

    const handleSubmit = (transaction: Transaction) => {
        if (editingTransaction) {
            editTransaction(editingTransaction.id, transaction);
        } else {
            addTransaction(transaction);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setTransactionToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (transactionToDelete) {
            removeTransaction(transactionToDelete);
        }
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setTransactionToDelete(null);
    };

    return (
        <Layout onAddTransaction={handleOpenForm}>
            <Container maxWidth="xl">
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Transactions
                    </Typography>

                    <Button
                        variant="outlined"
                        startIcon={sortOrder === 'newest' ? <ArrowDownward /> : <ArrowUpward />}
                        onClick={toggleSortOrder}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2
                        }}
                    >
                        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </Button>
                </Box>

                <Box>
                    <TransactionList
                        transactions={sortedTransactions}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                </Box>

                {/* Transaction Form Dialog */}
                <TransactionForm
                    open={formOpen}
                    onClose={handleCloseForm}
                    onSubmit={handleSubmit}
                    categories={categories}
                    editTransaction={editingTransaction}
                />

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialogOpen}
                    title="Delete Transaction"
                    message="Are you sure you want to delete this transaction? This action cannot be undone."
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            </Container>
        </Layout>
    );
}

'use client';

import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Layout from '@/components/Layout/Layout';
import TransactionList from '@/components/Dashboard/TransactionList';
import TransactionForm from '@/components/Forms/TransactionForm';
import ConfirmDialog from '@/components/Common/ConfirmDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/lib/types';

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
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Transactions
                </Typography>

                <Box>
                    <TransactionList
                        transactions={transactions}
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

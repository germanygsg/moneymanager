'use client';

import React, { useState } from 'react';
import { Box, Container, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Layout from '@/components/Layout/Layout';
import OverviewCards from '@/components/Dashboard/OverviewCards';
import Charts from '@/components/Dashboard/Charts';
import TransactionList from '@/components/Dashboard/TransactionList';
import TransactionForm from '@/components/Forms/TransactionForm';
import ConfirmDialog from '@/components/Common/ConfirmDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/lib/types';

export default function Home() {
  const {
    transactions,
    categories,
    summary,
    expensesByCategory,
    incomeByCategory,
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
        <Box sx={{ mb: 4 }}>
          <OverviewCards summary={summary} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Charts
            expensesByCategory={expensesByCategory}
            incomeByCategory={incomeByCategory}
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
          />
        </Box>

        <Box>
          <TransactionList
            transactions={transactions.slice(0, 10)}
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </Box>

        {/* Floating Action Button for mobile */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenForm}
          sx={{
            position: 'fixed',
            bottom: 80, // Above bottom nav (56px) + spacing
            right: 16,
            display: { xs: 'flex', sm: 'none' },
          }}
        >
          <AddIcon />
        </Fab>

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

'use client';

import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    IconButton,
    Stack,
    Menu,
    MenuItem,
    Tooltip,
    ListItemIcon,
    ListItemText,
    TextField,
    InputAdornment,
    Popover,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    ArrowUpward,
    ArrowDownward,
    Clear,
    FilterList,
    Category as CategoryIcon,
    Check,
    Search as SearchIcon
} from '@mui/icons-material';
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
        filters,
        updateFilters,
        clearFilters,
        addTransaction,
        editTransaction,
        removeTransaction,
    } = useTransactions();

    const [formOpen, setFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    // Filter Menu States
    const [typeAnchorEl, setTypeAnchorEl] = useState<null | HTMLElement>(null);
    const [categoryAnchorEl, setCategoryAnchorEl] = useState<null | HTMLElement>(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState<null | HTMLElement>(null);

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

    const handleTypeClick = (event: React.MouseEvent<HTMLElement>) => {
        setTypeAnchorEl(event.currentTarget);
    };

    const handleTypeClose = () => {
        setTypeAnchorEl(null);
    };

    const handleTypeSelect = (type: 'All' | 'Income' | 'Expense') => {
        updateFilters({ ...filters, type, category: undefined });
        handleTypeClose();
    };

    const handleCategoryClick = (event: React.MouseEvent<HTMLElement>) => {
        setCategoryAnchorEl(event.currentTarget);
    };

    const handleCategoryClose = () => {
        setCategoryAnchorEl(null);
    };

    const handleCategorySelect = (categoryName: string) => {
        updateFilters({ ...filters, category: categoryName });
        handleCategoryClose();
    };

    const handleSearchClick = (event: React.MouseEvent<HTMLElement>) => {
        setSearchAnchorEl(event.currentTarget);
    };

    const handleSearchClose = () => {
        setSearchAnchorEl(null);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateFilters({ ...filters, searchQuery: event.target.value });
    };

    const handleClearFilters = () => {
        clearFilters();
        handleSearchClose();
    };

    const filteredCategories = useMemo(() => {
        if (filters.type && filters.type !== 'All') {
            return categories.filter(c => c.type === filters.type);
        }
        return categories;
    }, [categories, filters.type]);

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
                <Box sx={{ mb: 3, mt: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Transactions
                    </Typography>
                </Box>

                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    py: 1.5,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'dark'
                        ? alpha(theme.palette.background.default, 0.95)
                        : alpha('#fafbfc', 0.95),
                    backdropFilter: 'blur(12px)',
                    borderBottom: 1,
                    borderColor: 'divider',
                    mx: -3,
                    px: 2,
                }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ width: '100%' }}>
                        {/* Type Filter */}
                        <Tooltip title="Filter by Type">
                            <IconButton
                                onClick={handleTypeClick}
                                color={filters.type !== 'All' ? 'primary' : 'default'}
                                size="small"
                            >
                                <FilterList />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={typeAnchorEl}
                            open={Boolean(typeAnchorEl)}
                            onClose={handleTypeClose}
                        >
                            <MenuItem onClick={() => handleTypeSelect('All')}>
                                <ListItemIcon>
                                    {(filters.type === 'All' || !filters.type) && <Check fontSize="small" />}
                                </ListItemIcon>
                                <ListItemText>All Transactions</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleTypeSelect('Income')}>
                                <ListItemIcon>
                                    {filters.type === 'Income' && <Check fontSize="small" />}
                                </ListItemIcon>
                                <ListItemText>Income Only</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleTypeSelect('Expense')}>
                                <ListItemIcon>
                                    {filters.type === 'Expense' && <Check fontSize="small" />}
                                </ListItemIcon>
                                <ListItemText>Expense Only</ListItemText>
                            </MenuItem>
                        </Menu>

                        {/* Category Filter */}
                        <Tooltip title="Filter by Category">
                            <IconButton
                                onClick={handleCategoryClick}
                                color={filters.category ? 'primary' : 'default'}
                                disabled={!categories.length}
                                size="small"
                            >
                                <CategoryIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            anchorEl={categoryAnchorEl}
                            open={Boolean(categoryAnchorEl)}
                            onClose={handleCategoryClose}
                            PaperProps={{ sx: { maxHeight: 300, width: 250 } }}
                        >
                            <MenuItem onClick={() => handleCategorySelect('')}>
                                <ListItemIcon>
                                    {!filters.category && <Check fontSize="small" />}
                                </ListItemIcon>
                                <ListItemText>All Categories</ListItemText>
                            </MenuItem>
                            {filteredCategories.map((category) => (
                                <MenuItem key={category.id} onClick={() => handleCategorySelect(category.name)}>
                                    <ListItemIcon>
                                        {filters.category === category.name && <Check fontSize="small" />}
                                    </ListItemIcon>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: '50%',
                                                bgcolor: category.color
                                            }}
                                        />
                                        <ListItemText primary={category.name} />
                                    </Box>
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* Search Filter */}
                        <Tooltip title="Search">
                            <IconButton
                                onClick={handleSearchClick}
                                color={filters.searchQuery ? 'primary' : 'default'}
                                size="small"
                            >
                                <SearchIcon />
                            </IconButton>
                        </Tooltip>
                        <Popover
                            open={Boolean(searchAnchorEl)}
                            anchorEl={searchAnchorEl}
                            onClose={handleSearchClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            <Box sx={{ p: 2, width: 300 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search amount, category, description..."
                                    value={filters.searchQuery || ''}
                                    onChange={handleSearchChange}
                                    autoFocus
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: filters.searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => updateFilters({ ...filters, searchQuery: '' })}
                                                >
                                                    <Clear fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Box>
                        </Popover>

                        {/* Sort Toggle */}
                        <Tooltip title={sortOrder === 'newest' ? 'Switch to Oldest First' : 'Switch to Newest First'}>
                            <IconButton
                                onClick={toggleSortOrder}
                                color="default"
                                size="small"
                            >
                                {sortOrder === 'newest' ? <ArrowDownward /> : <ArrowUpward />}
                            </IconButton>
                        </Tooltip>

                        {/* Clear Filter */}
                        {(filters.type !== 'All' || filters.category || filters.searchQuery) && (
                            <Tooltip title="Clear Filters">
                                <IconButton onClick={handleClearFilters} color="error" size="small">
                                    <Clear />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                </Box>

                <Box>
                    <TransactionList
                        transactions={sortedTransactions}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        title=""
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
        </Layout >
    );
}

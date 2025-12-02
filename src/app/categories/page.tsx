'use client';

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout/Layout';
import { useTransactions } from '@/hooks/useTransactions';
import { useLedger } from '@/contexts/LedgerContext';
import { Category, TransactionType } from '@/lib/types';

// Available Material Icons for categories
const AVAILABLE_ICONS = [
    'restaurant',
    'directions_car',
    'shopping_cart',
    'movie',
    'bolt',
    'local_hospital',
    'payments',
    'business_center',
    'trending_up',
    'more_horiz',
    'home',
    'school',
    'fitness_center',
    'flight',
    'phone',
    'computer',
    'pets',
    'sports_esports',
    'music_note',
    'book',
];

// Predefined color palette
const COLOR_PALETTE = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#FF8B94',
    '#C7CEEA', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3',
    '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B88B', '#FAD7A0', '#ABEBC6', '#D7BDE2', '#A9CCE3',
];

export default function CategoriesPage() {
    const { categories, addCategory, editCategory, removeCategory } = useTransactions();
    const { currentLedger } = useLedger();
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'Expense' as TransactionType,
        color: COLOR_PALETTE[0],
        icon: AVAILABLE_ICONS[0],
    });

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                type: category.type,
                color: category.color,
                icon: category.icon || AVAILABLE_ICONS[0],
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                type: 'Expense',
                color: COLOR_PALETTE[0],
                icon: AVAILABLE_ICONS[0],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCategory(null);
    };

    const handleSaveCategory = () => {
        if (!formData.name.trim()) {
            setSnackbar({ open: true, message: 'Category name is required', severity: 'error' });
            return;
        }

        if (!currentLedger) {
            setSnackbar({ open: true, message: 'No ledger selected. Please select a ledger first.', severity: 'error' });
            return;
        }

        const categoryData: Category = {
            id: editingCategory?.id || `cat_${Date.now()}`,
            name: formData.name.trim(),
            type: formData.type,
            color: formData.color,
            icon: formData.icon,
            ledgerId: currentLedger.id,
        };

        if (editingCategory) {
            editCategory(editingCategory.id, categoryData);
            setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
        } else {
            addCategory(categoryData);
            setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
        }

        handleCloseDialog();
    };

    const handleOpenDeleteDialog = (categoryId: string) => {
        setDeletingCategoryId(categoryId);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDeletingCategoryId(null);
    };

    const handleDeleteCategory = () => {
        if (deletingCategoryId) {
            removeCategory(deletingCategoryId);
            setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
            handleCloseDeleteDialog();
        }
    };

    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Categories
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            },
                        }}
                    >
                        Add Category
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)',
                            lg: 'repeat(4, 1fr)',
                        },
                        gap: { xs: 2, sm: 3 },
                    }}
                >
                    {categories.map((category) => (
                        <Card
                            key={category.id}
                            sx={{
                                borderLeft: `6px solid ${category.color}`,
                                position: 'relative',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                            {category.name}
                                        </Typography>
                                        <Chip
                                            label={category.type}
                                            color={category.type === 'Income' ? 'success' : 'error'}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                    {category.icon && (
                                        <Box
                                            sx={{
                                                width: { xs: 36, sm: 40 },
                                                height: { xs: 36, sm: 40 },
                                                borderRadius: '50%',
                                                backgroundColor: `${category.color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: category.color,
                                                flexShrink: 0,
                                                ml: 1,
                                            }}
                                        >
                                            <span className="material-icons" style={{ fontSize: '20px' }}>{category.icon}</span>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(category)}
                                        sx={{
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' },
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDeleteDialog(category.id)}
                                        sx={{
                                            color: 'error.main',
                                            '&:hover': { backgroundColor: 'error.light', color: 'error.dark' },
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Create/Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                            <TextField
                                label="Category Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                fullWidth
                                required
                                autoFocus
                            />

                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Type"
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                                >
                                    <MenuItem value="Income">Income</MenuItem>
                                    <MenuItem value="Expense">Expense</MenuItem>
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Color
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {COLOR_PALETTE.map((color) => (
                                        <Box
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: color,
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                border: formData.color === color ? '3px solid #000' : '2px solid transparent',
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.1)',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                    Icon
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {AVAILABLE_ICONS.map((icon) => (
                                        <Box
                                            key={icon}
                                            onClick={() => setFormData({ ...formData, icon })}
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                backgroundColor: formData.icon === icon ? `${formData.color}30` : 'transparent',
                                                border: formData.icon === icon ? `2px solid ${formData.color}` : '1px solid #ddd',
                                                color: formData.icon === icon ? formData.color : '#666',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    backgroundColor: `${formData.color}20`,
                                                    transform: 'scale(1.05)',
                                                },
                                            }}
                                        >
                                            <span className="material-icons">{icon}</span>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseDialog} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory} variant="contained">
                            {editingCategory ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this category? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseDeleteDialog} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteCategory} variant="contained" color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Layout>
    );
}

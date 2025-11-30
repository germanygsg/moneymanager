'use client';

import React, { useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    FormControl,
    Box,
    Alert,
    Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import Layout from '@/components/Layout/Layout';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';

export default function SettingsPage() {
    const { clearData, allTransactions, categories } = useTransactions();
    const { currency, setCurrency } = useCurrency();
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const handleCurrencyChange = (event: any) => {
        const newCurrencyCode = event.target.value;
        const newCurrency = CURRENCIES.find(c => c.code === newCurrencyCode);
        if (newCurrency) {
            setCurrency(newCurrency);
            setSnackbar({ open: true, message: 'Currency updated successfully', severity: 'success' });
        }
    };

    const handleClearData = () => {
        clearData();
        setOpenClearDialog(false);
        setSnackbar({ open: true, message: 'All data cleared successfully', severity: 'success' });
    };

    const handleExportData = () => {
        const data = {
            transactions: allTransactions,
            categories,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `money-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.transactions && data.categories) {
                    localStorage.setItem('dexter_cashflow_transactions', JSON.stringify(data.transactions));
                    localStorage.setItem('dexter_cashflow_categories', JSON.stringify(data.categories));
                    setSnackbar({ open: true, message: 'Data imported successfully. Please refresh the page.', severity: 'success' });
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    setSnackbar({ open: true, message: 'Invalid data format', severity: 'error' });
                }
            } catch (error) {
                setSnackbar({ open: true, message: 'Error importing data', severity: 'error' });
            }
        };
        reader.readAsText(file);
    };

    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Settings
                </Typography>

                <Paper sx={{ maxWidth: 600 }}>
                    <List>
                        {/* Currency Setting */}
                        <ListItem>
                            <ListItemText
                                primary="Currency"
                                secondary="Select your preferred currency"
                            />
                            <FormControl sx={{ minWidth: 150 }}>
                                <Select
                                    value={currency.code}
                                    onChange={handleCurrencyChange}
                                    size="small"
                                >
                                    {CURRENCIES.map((curr) => (
                                        <MenuItem key={curr.code} value={curr.code}>
                                            {curr.symbol} {curr.code} - {curr.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </ListItem>
                        <Divider />

                        {/* Export Data */}
                        <ListItem>
                            <ListItemText
                                primary="Export Data"
                                secondary="Download all your transactions and categories"
                            />
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleExportData}
                            >
                                Export
                            </Button>
                        </ListItem>
                        <Divider />

                        {/* Import Data */}
                        <ListItem>
                            <ListItemText
                                primary="Import Data"
                                secondary="Restore from a backup file"
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<UploadIcon />}
                            >
                                Import
                                <input
                                    type="file"
                                    hidden
                                    accept=".json"
                                    onChange={handleImportData}
                                />
                            </Button>
                        </ListItem>
                        <Divider />

                        {/* Clear All Data */}
                        <ListItem>
                            <ListItemText
                                primary="Clear All Data"
                                secondary="Delete all transactions and reset categories"
                            />
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setOpenClearDialog(true)}
                            >
                                Clear
                            </Button>
                        </ListItem>
                    </List>
                </Paper>

                {/* App Information */}
                <Box sx={{ mt: 4, maxWidth: 600 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        ONLINE LEDGER - Financial Tracker
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Version 1.0.0
                    </Typography>
                </Box>
            </Container>

            {/* Clear Data Confirmation Dialog */}
            <Dialog
                open={openClearDialog}
                onClose={() => setOpenClearDialog(false)}
            >
                <DialogTitle>Clear All Data?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete all your transactions and reset categories to default.
                        This action cannot be undone. Consider exporting your data first.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenClearDialog(false)}>Cancel</Button>
                    <Button onClick={handleClearData} color="error" variant="contained">
                        Clear All Data
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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
        </Layout>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
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
    TextField,
    IconButton,
    Chip,
    Stack,
    CircularProgress,
    SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import Layout from '@/components/Layout/Layout';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';
import { useLedger } from '@/contexts/LedgerContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SharedUser {
    id: string;
    username: string;
    role: string;
    createdAt: string;
}

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { clearData, allTransactions, categories } = useTransactions();
    const { currency, setCurrency } = useCurrency();
    const { currentLedger, refreshLedgers } = useLedger();
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [loadingSharedUsers, setLoadingSharedUsers] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, router]);

    // Load shared users
    useEffect(() => {
        if (session?.user) {
            loadSharedUsers();
        }
    }, [session]);

    const loadSharedUsers = async () => {
        setLoadingSharedUsers(true);
        try {
            const response = await fetch('/api/ledger/invite');
            if (response.ok) {
                const data = await response.json();
                setSharedUsers(data.sharedUsers);
            }
        } catch (error) {
            console.error('Error loading shared users:', error);
        } finally {
            setLoadingSharedUsers(false);
        }
    };


    const handleCurrencyChange = async (event: SelectChangeEvent) => {
        const newCurrencyCode = event.target.value;
        const newCurrency = CURRENCIES.find(c => c.code === newCurrencyCode);
        if (!newCurrency || !currentLedger) {
            return;
        }

        try {
            // Update the ledger's currency in the database
            const response = await fetch(`/api/ledger/${currentLedger.id}/currency`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currency: newCurrency.code }),
            });

            if (!response.ok) {
                const data = await response.json();
                setSnackbar({ open: true, message: data.error || 'Failed to update currency', severity: 'error' });
                return;
            }

            // Update local currency state
            setCurrency(newCurrency);

            // Refresh ledgers to get updated currency for all users
            await refreshLedgers();

            setSnackbar({ open: true, message: 'Currency updated successfully for all users', severity: 'success' });
        } catch (error) {
            console.error('Error updating currency:', error);
            setSnackbar({ open: true, message: 'An error occurred while updating currency', severity: 'error' });
        }
    };

    const handleInviteUser = async () => {
        if (!inviteUsername.trim()) {
            setSnackbar({ open: true, message: 'Please enter a username', severity: 'error' });
            return;
        }

        setInviteLoading(true);
        try {
            const response = await fetch('/api/ledger/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: inviteUsername, role: 'editor' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSnackbar({ open: true, message: data.error || 'Failed to invite user', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: 'User invited successfully', severity: 'success' });
                setOpenInviteDialog(false);
                setInviteUsername('');
                loadSharedUsers();
            }
        } catch {
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/ledger/invite/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                setSnackbar({ open: true, message: data.error || 'Failed to remove user', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: 'User removed successfully', severity: 'success' });
                loadSharedUsers();
            }
        } catch {
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        }
    };

    const handleClearData = () => {
        clearData();
        setOpenClearDialog(false);
        setSnackbar({ open: true, message: 'All data cleared successfully', severity: 'success' });
    };

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
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
            } catch {
                setSnackbar({ open: true, message: 'Error importing data', severity: 'error' });
            }
        };
        reader.readAsText(file);
    };

    if (status === 'loading') {
        return (
            <Layout onAddTransaction={() => { }} showAddButton={false}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Container>
            </Layout>
        );
    }

    if (!session) {
        return null;
    }


    return (
        <Layout onAddTransaction={() => { }} showAddButton={false}>
            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Settings
                </Typography>

                {/* Account Information */}
                <Paper sx={{ maxWidth: 600, mb: 3, p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                        Account Information
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Username
                            </Typography>
                            <Typography variant="h6">
                                {session.user.username}
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleSignOut}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Paper>

                {/* Collaboration */}
                <Paper sx={{ maxWidth: 600, mb: 3 }}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Invite User to Collaborate"
                                secondary="Share your ledger with other users"
                            />
                            <Button
                                variant="outlined"
                                startIcon={<PersonAddIcon />}
                                onClick={() => setOpenInviteDialog(true)}
                            >
                                Invite
                            </Button>
                        </ListItem>
                    </List>

                    {loadingSharedUsers ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : sharedUsers.length > 0 && (
                        <Box sx={{ px: 2, pb: 2 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Shared with:
                            </Typography>
                            <Stack spacing={1}>
                                {sharedUsers.map((user) => (
                                    <Box
                                        key={user.id}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 1,
                                            bgcolor: 'action.hover',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography>{user.username}</Typography>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveUser(user.id)}
                                            color="error"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Paper>

                <Paper sx={{ maxWidth: 600 }}>
                    <List>
                        {/* Currency Setting */}
                        <ListItem>
                            <ListItemText
                                primary="Currency"
                                secondary="Currency for this ledger (affects all users)"
                            />
                            <FormControl sx={{ minWidth: 150 }}>
                                <Select
                                    value={currency.code}
                                    onChange={handleCurrencyChange}
                                    size="small"
                                    disabled={currentLedger?.role === 'viewer'}
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
                        Version 2.0.0 - Multi-user Edition
                    </Typography>
                </Box>
            </Container>

            {/* Invite User Dialog */}
            <Dialog
                open={openInviteDialog}
                onClose={() => setOpenInviteDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Invite User to Collaborate</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter the username of the user you want to invite to access your ledger.
                        They will be able to view and edit transactions.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Username"
                        value={inviteUsername}
                        onChange={(e) => setInviteUsername(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleInviteUser();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleInviteUser}
                        variant="contained"
                        disabled={inviteLoading}
                    >
                        {inviteLoading ? 'Inviting...' : 'Invite'}
                    </Button>
                </DialogActions>
            </Dialog>

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

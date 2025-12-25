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
import HistoryIcon from '@mui/icons-material/History';
import UploadIcon from '@mui/icons-material/Upload';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StorageIcon from '@mui/icons-material/Storage';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ViewListIcon from '@mui/icons-material/ViewList';
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

interface ReceiptStats {
    totalReceipts: number;
    totalSize: number;
    formattedSize: string;
}

import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { clearData, allTransactions, categories } = useTransactions();
    const { currency, setCurrency } = useCurrency();
    const { currentLedger, availableLedgers, switchLedger, refreshLedgers, isLoading: ledgerLoading } = useLedger();
    const [openClearDialog, setOpenClearDialog] = useState(false);
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [openClearReceiptsDialog, setOpenClearReceiptsDialog] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [loadingSharedUsers, setLoadingSharedUsers] = useState(false);
    const [receiptStats, setReceiptStats] = useState<ReceiptStats | null>(null);
    const [loadingReceiptStats, setLoadingReceiptStats] = useState(false);
    const [clearingReceipts, setClearingReceipts] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Transaction Display Mode State
    const [transactionDisplayMode, setTransactionDisplayMode] = useState<'cards' | 'table'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('transaction_display_mode');
            return (saved as 'cards' | 'table') || 'cards';
        }
        return 'cards';
    });

    // Ledger Renaming State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');

    // Ledger Renaming Handlers
    const handleStartEditName = () => {
        if (currentLedger) {
            setEditName(currentLedger.name);
            setIsEditingName(true);
        }
    };

    const handleCancelEditName = () => {
        setIsEditingName(false);
        setEditName('');
    };

    const handleSaveLedgerName = async () => {
        if (!editName.trim() || !currentLedger) return;

        try {
            const response = await fetch(`/api/ledger/${currentLedger.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName }),
            });

            if (response.ok) {
                await refreshLedgers();
                setSnackbar({ open: true, message: 'Ledger name updated successfully', severity: 'success' });
                setIsEditingName(false);
            } else {
                const data = await response.json();
                setSnackbar({ open: true, message: data.error || 'Failed to update ledger name', severity: 'error' });
            }
        } catch (error) {
            console.error('Error updating ledger name:', error);
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        }
    };

    // Transaction Display Mode Handler


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

    // Load receipt stats when ledger changes
    useEffect(() => {
        if (session?.user && currentLedger) {
            loadReceiptStats();
        }
    }, [session, currentLedger]);

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

    const loadReceiptStats = async () => {
        setLoadingReceiptStats(true);
        try {
            const response = await fetch('/api/receipts/stats');
            if (response.ok) {
                const data = await response.json();
                setReceiptStats(data);
            }
        } catch (error) {
            console.error('Error loading receipt stats:', error);
        } finally {
            setLoadingReceiptStats(false);
        }
    };

    const handleClearReceipts = async () => {
        setClearingReceipts(true);
        try {
            const response = await fetch('/api/receipts/stats', {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                setSnackbar({ open: true, message: data.error || 'Failed to clear receipts', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: `Cleared ${data.clearedCount} receipt image(s)`, severity: 'success' });
                loadReceiptStats(); // Refresh stats
            }
        } catch (error) {
            console.error('Error clearing receipts:', error);
            setSnackbar({ open: true, message: 'An error occurred', severity: 'error' });
        } finally {
            setClearingReceipts(false);
            setOpenClearReceiptsDialog(false);
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
                body: JSON.stringify({ username: inviteUsername, role: inviteRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                setSnackbar({ open: true, message: data.error || 'Failed to invite user', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: 'User invited successfully', severity: 'success' });
                setOpenInviteDialog(false);
                setInviteUsername('');
                setInviteRole('editor'); // Reset to default
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

    const handleUpdateUserRole = async (userId: string, newRole: 'editor' | 'viewer') => {
        try {
            const response = await fetch(`/api/ledger/invite/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const data = await response.json();
                setSnackbar({ open: true, message: data.error || 'Failed to update role', severity: 'error' });
            } else {
                setSnackbar({ open: true, message: 'Role updated successfully', severity: 'success' });
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

                {/* Ledger Switcher */}
                <Paper sx={{ maxWidth: 600, mb: 3, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AccountBalanceIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Current Ledger
                        </Typography>
                    </Box>

                    {ledgerLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : currentLedger ? (
                        <Box>
                            {/* Current Ledger Display */}
                            <Box sx={{
                                p: 2,
                                mb: 2,
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <Box sx={{ flexGrow: 1, mr: 2 }}>
                                    {isEditingName ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <TextField
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                autoFocus
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        height: 32,
                                                    }
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={handleSaveLedgerName}
                                                sx={{ color: 'primary.contrastText', bgcolor: 'rgba(255,255,255,0.2)' }}
                                            >
                                                <CheckIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={handleCancelEditName}
                                                sx={{ color: 'primary.contrastText', bgcolor: 'rgba(255,255,255,0.2)' }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>
                                                {currentLedger.name}
                                            </Typography>
                                            {currentLedger.isOwner && (
                                                <IconButton
                                                    size="small"
                                                    onClick={handleStartEditName}
                                                    sx={{
                                                        color: 'inherit',
                                                        opacity: 0.7,
                                                        p: 0.5,
                                                        '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.1)' }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    )}
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        {currentLedger.currency}
                                        {!currentLedger.isOwner && ` • Shared with you`}
                                    </Typography>
                                </Box>
                                {!currentLedger.isOwner && (
                                    <Chip
                                        label={currentLedger.role}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.2)',
                                            color: 'inherit',
                                            fontWeight: 500
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Activity Logs Button */}
                            <Box sx={{ mb: 3 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<HistoryIcon />}
                                    onClick={() => router.push('/logs')}
                                    sx={{
                                        justifyContent: 'flex-start',
                                        py: 1,
                                        borderColor: 'divider',
                                        color: 'text.primary',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'action.hover',
                                        }
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left' }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            Shared Ledger Activities
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            View activity logs for all shared ledgers
                                        </Typography>
                                    </Box>
                                </Button>
                            </Box>

                            {/* Other Ledgers */}
                            {availableLedgers && availableLedgers.length > 1 && (
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Switch to another ledger:
                                    </Typography>
                                    <Stack spacing={1}>
                                        {availableLedgers
                                            .filter(ledger => ledger.id !== currentLedger.id)
                                            .map((ledger) => (
                                                <Box
                                                    key={ledger.id}
                                                    onClick={() => switchLedger(ledger.id)}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            borderColor: 'primary.main',
                                                            bgcolor: 'action.hover',
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        {ledger.isOwner ? (
                                                            <PersonIcon fontSize="small" color="action" />
                                                        ) : (
                                                            <GroupIcon fontSize="small" color="action" />
                                                        )}
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {ledger.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {ledger.currency}
                                                                {!ledger.isOwner && ledger.owner && ` • Owned by ${ledger.owner.username}`}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    {!ledger.isOwner && (
                                                        <Chip
                                                            label={ledger.role}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ height: 22, fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            ))}
                                    </Stack>
                                </Box>
                            )}

                            {availableLedgers && availableLedgers.length === 1 && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                                    You have only one ledger. Invite users to collaborate or get invited to other ledgers.
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No ledger available
                        </Typography>
                    )}
                </Paper>

                {/* Collaboration */}
                <Paper sx={{ maxWidth: 600, mb: 3 }}>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Invite User to Collaborate"
                                secondary={currentLedger?.isOwner ? "Share your ledger with other users" : "Only the ledger owner can invite users"}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<PersonAddIcon />}
                                onClick={() => setOpenInviteDialog(true)}
                                disabled={!currentLedger?.isOwner}
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography>{user.username}</Typography>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <Select
                                                    value={user.role}
                                                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'editor' | 'viewer')}
                                                    disabled={!currentLedger?.isOwner}
                                                    sx={{ height: 32 }}
                                                >
                                                    <MenuItem value="editor">Editor</MenuItem>
                                                    <MenuItem value="viewer">Viewer</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveUser(user.id)}
                                            color="error"
                                            disabled={!currentLedger?.isOwner}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Paper>

                {/* Receipt Storage */}
                <Paper sx={{ maxWidth: 600, mb: 3, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <StorageIcon color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Receipt Image Storage
                        </Typography>
                    </Box>

                    {loadingReceiptStats ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : receiptStats ? (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Receipts
                                    </Typography>
                                    <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ReceiptIcon color="info" />
                                        {receiptStats.totalReceipts}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Storage Used
                                    </Typography>
                                    <Typography variant="h5">
                                        {receiptStats.formattedSize}
                                    </Typography>
                                </Box>
                            </Box>

                            {receiptStats.totalReceipts > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                Clear All Receipt Images
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Remove all receipt images from this ledger
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => setOpenClearReceiptsDialog(true)}
                                            disabled={!currentLedger?.isOwner}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {receiptStats.totalReceipts === 0 && (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    No receipt images stored in this ledger
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Unable to load receipt statistics
                        </Typography>
                    )}
                </Paper>

                <Paper sx={{ maxWidth: 600 }}>
                    <List>
                        {/* Currency Setting */}
                        <ListItem>
                            <ListItemText
                                primary="Currency"
                                secondary={currentLedger?.isOwner ? "Currency for this ledger (affects all users)" : "Only the ledger owner can change currency"}
                            />
                            <FormControl sx={{ minWidth: 150 }}>
                                <Select
                                    value={currency.code}
                                    onChange={handleCurrencyChange}
                                    size="small"
                                    disabled={!currentLedger?.isOwner}
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

                        {/* Transaction Display Mode */}
                        <ListItem>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                                <ViewListIcon color="action" />
                                <ListItemText
                                    primary="Transaction Display Mode"
                                />
                            </Box>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                    value={transactionDisplayMode}
                                    onChange={(e) => {
                                        const newMode = e.target.value as 'cards' | 'table';
                                        setTransactionDisplayMode(newMode);
                                        localStorage.setItem('transaction_display_mode', newMode);
                                    }}
                                >
                                    <MenuItem value="cards">Cards</MenuItem>
                                    <MenuItem value="table">Table</MenuItem>
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
                        ONLINE LEDGER - Dexter internal tool
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        v0.9.1 - Made with ❤️ in Bekasi
                    </Typography>
                </Box>
            </Container>

            {/* Invite User Dialog */}
            <Dialog
                open={openInviteDialog}
                onClose={() => {
                    setOpenInviteDialog(false);
                    setInviteUsername('');
                    setInviteRole('editor');
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Invite User to Collaborate</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter the username of the user you want to invite to access your ledger.
                        Choose their permission level below.
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
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Permission Level
                        </Typography>
                        <Select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                            size="small"
                        >
                            <MenuItem value="editor">
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>Editor</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Can view, add, edit, and delete transactions
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem value="viewer">
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>Viewer</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Can only view transactions (read-only)
                                    </Typography>
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenInviteDialog(false);
                        setInviteUsername('');
                        setInviteRole('editor');
                    }}>Cancel</Button>
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

            {/* Clear Receipts Confirmation Dialog */}
            <Dialog
                open={openClearReceiptsDialog}
                onClose={() => setOpenClearReceiptsDialog(false)}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon color="error" />
                    Clear All Receipt Images?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This will permanently delete all receipt images ({receiptStats?.totalReceipts || 0} images, {receiptStats?.formattedSize || '0 Bytes'})
                        from your current ledger. The transactions themselves will remain intact.
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenClearReceiptsDialog(false)} disabled={clearingReceipts}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClearReceipts}
                        color="error"
                        variant="contained"
                        disabled={clearingReceipts}
                    >
                        {clearingReceipts ? 'Clearing...' : 'Clear All Receipts'}
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


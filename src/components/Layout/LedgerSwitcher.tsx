'use client';

import React, { useState } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Typography,
    Divider,
} from '@mui/material';
import {
    AccountBalance as LedgerIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Check as CheckIcon,
    Person as PersonIcon,
    Group as GroupIcon,
} from '@mui/icons-material';
import { useLedger } from '@/contexts/LedgerContext';

export default function LedgerSwitcher() {
    const { currentLedger, availableLedgers, switchLedger, isLoading } = useLedger();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectLedger = (ledgerId: string) => {
        switchLedger(ledgerId);
        handleClose();
    };

    if (isLoading || !currentLedger) {
        return null;
    }

    return (
        <Box>
            <Button
                variant="outlined"
                onClick={handleClick}
                endIcon={<ArrowDownIcon />}
                startIcon={<LedgerIcon />}
                sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                        {currentLedger.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {currentLedger.currency}
                    </Typography>
                </Box>
                {!currentLedger.isOwner && (
                    <Chip
                        label="Shared"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                )}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 280,
                        maxHeight: 400,
                        borderRadius: 2,
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        SELECT LEDGER
                    </Typography>
                </Box>
                <Divider />

                {availableLedgers.map((ledger) => (
                    <MenuItem
                        key={ledger.id}
                        onClick={() => handleSelectLedger(ledger.id)}
                        selected={ledger.id === currentLedger.id}
                        sx={{
                            py: 1.5,
                            px: 2,
                            '&.Mui-selected': {
                                bgcolor: 'action.selected',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            {ledger.id === currentLedger.id ? (
                                <CheckIcon color="primary" fontSize="small" />
                            ) : ledger.isOwner ? (
                                <PersonIcon fontSize="small" />
                            ) : (
                                <GroupIcon fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                        {ledger.name}
                                    </Typography>
                                    {!ledger.isOwner && (
                                        <Chip
                                            label={ledger.role}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                        />
                                    )}
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" color="text.secondary">
                                    {ledger.currency}
                                    {!ledger.isOwner && ledger.owner && ` • Owned by ${ledger.owner.username}`}
                                </Typography>
                            }
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}

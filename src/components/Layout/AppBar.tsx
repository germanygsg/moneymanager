'use client';

import React from 'react';
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface AppBarProps {
    onAddClick: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    showAddButton?: boolean;
}

export default function AppBar({ onAddClick, darkMode, onToggleDarkMode, showAddButton = true }: AppBarProps) {
    return (
        <MuiAppBar position="fixed" elevation={0} sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                    ONLINE LEDGER
                </Typography>

                <IconButton onClick={onToggleDarkMode} color="inherit" sx={{ mr: 1 }}>
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                {showAddButton && (
                    <>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAddClick}
                            sx={{ display: { xs: 'none', sm: 'flex' } }}
                        >
                            Add Transaction
                        </Button>

                        <IconButton
                            color="primary"
                            onClick={onAddClick}
                            sx={{ display: { xs: 'flex', sm: 'none' } }}
                        >
                            <AddIcon />
                        </IconButton>
                    </>
                )}
            </Toolbar>
        </MuiAppBar>
    );
}

'use client';

import React, { useState } from 'react';
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface AppBarProps {
    onMenuClick: () => void;
    onAddClick: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

export default function AppBar({ onMenuClick, onAddClick, darkMode, onToggleDarkMode }: AppBarProps) {
    return (
        <MuiAppBar position="fixed" elevation={0} sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
                    💰 Dexter Cashflow
                </Typography>

                <IconButton onClick={onToggleDarkMode} color="inherit" sx={{ mr: 1 }}>
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

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
            </Toolbar>
        </MuiAppBar>
    );
}

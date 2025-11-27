'use client';

import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { useTheme } from '@/components/ThemeProvider/ThemeProvider';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
    children: React.ReactNode;
    onAddTransaction: () => void;
    showAddButton?: boolean;
}

export default function Layout({ children, onAddTransaction, showAddButton = true }: LayoutProps) {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                onAddClick={onAddTransaction}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                showAddButton={showAddButton}
            />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    pb: { xs: 10, sm: 3 }, // Extra padding at bottom for mobile nav
                    width: { sm: `calc(100% - 240px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Toolbar />
                {children}
            </Box>
            <BottomNav />
        </Box>
    );
}

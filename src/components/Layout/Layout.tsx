'use client';

import React, { useState } from 'react';
import { Box, Toolbar, ThemeProvider, CssBaseline } from '@mui/material';
import { theme, darkTheme } from '@/theme/theme';
import AppBar from './AppBar';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
    onAddTransaction: () => void;
}

export default function Layout({ children, onAddTransaction }: LayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <ThemeProvider theme={darkMode ? darkTheme : theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex' }}>
                <AppBar
                    onMenuClick={handleDrawerToggle}
                    onAddClick={onAddTransaction}
                    darkMode={darkMode}
                    onToggleDarkMode={handleToggleDarkMode}
                />
                <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        width: { sm: `calc(100% - 240px)` },
                        minHeight: '100vh',
                        bgcolor: 'background.default',
                    }}
                >
                    <Toolbar />
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
